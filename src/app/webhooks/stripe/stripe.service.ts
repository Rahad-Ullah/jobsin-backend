import Stripe from 'stripe';
import { stripe } from '../../../config/stripe';
import { Subscription } from '../../modules/subscription/subscription.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import {
  PaymentStatus,
  SubscriptionStatus,
} from '../../modules/subscription/subscription.constants';
import { User } from '../../modules/user/user.model';
import { Invoice } from '../../modules/invoice/invoice.model';
import { IInvoice } from '../../modules/invoice/invoice.interface';
import { InvoiceStatus } from '../../modules/invoice/invoice.constants';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';

// on payment intent succeeded
const onPaymentIntentSucceeded = async (event: Stripe.Event) => {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  // fetch the latest invoice for this payment intent
  const invoicesList = await stripe.invoices.list({
    customer: paymentIntent.customer as string,
    limit: 5,
  });

  // find the latest one matching the payment intent
  const stripeInvoice =
    invoicesList.data.find(
      inv =>
        inv.amount_paid === paymentIntent.amount_received &&
        inv.status === 'paid',
    ) ?? invoicesList.data[0];

  const invoicePayload: Partial<IInvoice> = {
    // Stripe references
    stripeInvoiceId: stripeInvoice.id,
    stripeSubscriptionId:
      (stripeInvoice.parent?.subscription_details?.subscription as string) ||
      '',
    stripeCustomerId: stripeInvoice.customer as string,
    stripePaymentIntentId: paymentIntent.id,
    stripeChargeId: paymentIntent.latest_charge as string,

    // Invoice details
    invoiceNumber: stripeInvoice.number ?? undefined,
    periodStart: new Date(stripeInvoice.period_start * 1000),
    periodEnd: new Date(stripeInvoice.period_end * 1000),

    // Money
    amount: stripeInvoice.total / 100, // cents → dollars
    currency: stripeInvoice.currency,

    // Status
    status: InvoiceStatus.PAID,
    paidAt: stripeInvoice.status_transitions?.paid_at
      ? new Date(stripeInvoice.status_transitions.paid_at * 1000)
      : null,

    // URLs
    invoicePdfUrl: stripeInvoice.invoice_pdf ?? null,
    hostedInvoiceUrl: stripeInvoice.hosted_invoice_url ?? null,
  };

  // create or update invoice in DB
  await Invoice.findOneAndUpdate(
    { stripeInvoiceId: stripeInvoice.id },
    invoicePayload,
    { upsert: true, new: true },
  );
};

// on checkout session completed
const onCustomerSubscriptionCreated = async (event: Stripe.Event) => {
  try {
    const stripeSubscription = event.data.object as Stripe.Subscription;

    const stripeSub: Stripe.Subscription = await stripe.subscriptions.retrieve(
      stripeSubscription.id as string,
      {
        expand: ['items.data.price', 'latest_invoice.lines.data.price'],
      },
    );

    const stripePrice = stripeSub.items.data[0].price;
    const unitAmount = stripePrice.unit_amount! / 100;

    const stripeInvoice = stripeSub.latest_invoice as Stripe.Invoice;
    if (!stripeInvoice?.lines?.data?.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invoice lines not found');
    }
    const period = stripeInvoice.lines.data[0].period;

    // DB write: create subscription
    const payload = {
      user: stripeSub.metadata?.userId,
      package: stripeSub.metadata?.packageId,
      stripeSubscriptionId: stripeSub.id,
      stripeCustomerId: stripeSub.customer as string,
      stripePriceId: stripePrice.id,
      price: unitAmount,
      currentPeriodStart: new Date(period.start * 1000),
      currentPeriodEnd: new Date(period.end * 1000),
      cancelAtPeriodEnd: (stripeSub as any).cancel_at_period_end,
      status: stripeSub.status,
      paymentStatus:
        stripeSub.status === SubscriptionStatus.TRIALING
          ? PaymentStatus.UNPAID
          : PaymentStatus.PAID,
    };

    const result = await Subscription.create(payload);
    if (!result) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Subscription creation failed',
      );
    }

    // DB write: update user subscription
    await User.findByIdAndUpdate(stripeSub.metadata?.userId, {
      subscription: result._id,
    });

    // DB write: create invoice
    const invoicePayload: Partial<IInvoice> = {
      user: result.user,
      subscription: result._id,
      stripeSubscriptionId: stripeSub.id,
      stripeInvoiceId: stripeInvoice.id,
      stripeCustomerId: stripeSub.customer as string,
      invoiceNumber: stripeInvoice.number!,
      periodStart: new Date(period.start * 1000),
      periodEnd: new Date(period.end * 1000),
      amount: unitAmount,
      currency: stripeSub.currency,
      status: InvoiceStatus.PAID,
      paidAt: new Date(stripeInvoice.status_transitions.paid_at! * 1000),
      invoicePdfUrl: stripeInvoice.invoice_pdf,
      hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
    };
    const invoiceResult = await Invoice.findOneAndUpdate(
      { stripeInvoiceId: stripeInvoice.id },
      invoicePayload,
      { upsert: true, new: true },
    );
    if (!invoiceResult) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invoice creation failed');
    }
  } catch (error) {
    console.error('Error onCheckoutSessionCompleted  ~~ ', error);
  }
};

// on invoice paid
const onInvoicePaid = async (event: Stripe.Event) => {
  try {
    const stripeInvoice = event.data.object as Stripe.Invoice;
    let stripeSubscriptionId = (stripeInvoice as any).subscription as
      | string
      | null;
    // Fallback: Checkout Session / parent
    if (
      !stripeSubscriptionId &&
      stripeInvoice.parent?.subscription_details?.subscription
    ) {
      stripeSubscriptionId = stripeInvoice.parent.subscription_details
        .subscription as string;
    }

    if (!stripeSubscriptionId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Subscription ID not found in invoice',
      );
    }

    // check if subscription exists
    const existingSubscription = await Subscription.exists({
      stripeSubscriptionId: stripeSubscriptionId,
    }).lean();
    if (!existingSubscription) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription not found');
    }

    // DB write: update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: stripeSubscriptionId },
      {
        paymentStatus: PaymentStatus.PAID,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(stripeInvoice.period_start * 1000),
        currentPeriodEnd: new Date(stripeInvoice.period_end * 1000),
      },
      { new: true },
    );

    // DB write: create invoice
    const invoicePayload: Partial<IInvoice> = {
      user: subscription?.user,
      subscription: subscription?._id,
      stripeSubscriptionId: stripeSubscriptionId,
      stripeInvoiceId: stripeInvoice.id,
      invoiceNumber: stripeInvoice.number!,
      periodStart: new Date(stripeInvoice.period_start * 1000),
      periodEnd: new Date(stripeInvoice.period_end * 1000),
      amount: stripeInvoice.total / 100,
      currency: stripeInvoice.currency,
      status: InvoiceStatus.PAID,
      paidAt: new Date(stripeInvoice.status_transitions.paid_at! * 1000),
      invoicePdfUrl: stripeInvoice.invoice_pdf,
      hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
    };

    const result = await Invoice.findOneAndUpdate(
      { stripeInvoiceId: stripeInvoice.id },
      invoicePayload,
      { upsert: true, new: true },
    );
    if (!result) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Invoice creation failed',
      );
    }
  } catch (error) {
    console.error('Error onInvoicePaid  ~~ ', error);
  }
};

// on invoice payment failed
const onInvoicePaymentFailed = async (event: Stripe.Event) => {
  try {
    const stripeInvoice = event.data.object as Stripe.Invoice;
    const stripeSubscriptionId = (stripeInvoice as any).subscription as
      | string
      | null;

    if (!stripeSubscriptionId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Subscription ID not found in invoice',
      );
    }

    // check if subscription exists
    const existingSubscription = await Subscription.exists({
      stripeSubscriptionId: stripeSubscriptionId,
    }).lean();
    if (!existingSubscription) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription not found');
    }

    // DB write: update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: stripeSubscriptionId },
      {
        paymentStatus: PaymentStatus.UNPAID,
        status: SubscriptionStatus.PAST_DUE,
        currentPeriodStart: new Date(stripeInvoice.period_start * 1000),
        currentPeriodEnd: new Date(stripeInvoice.period_end * 1000),
      },
      { new: true },
    ).populate('user package');

    // DB write: create invoice
    const invoicePayload: Partial<IInvoice> = {
      user: subscription?.user,
      subscription: subscription?._id,
      stripeSubscriptionId: stripeSubscriptionId,
      stripeInvoiceId: stripeInvoice.id,
      invoiceNumber: stripeInvoice.number!,
      periodStart: new Date(stripeInvoice.period_start * 1000),
      periodEnd: new Date(stripeInvoice.period_end * 1000),
      amount: stripeInvoice.total / 100,
      currency: stripeInvoice.currency,
      status: InvoiceStatus.RETRYING,
      paidAt: null,
    };

    const result = await Invoice.findOneAndUpdate(
      { stripeInvoiceId: stripeInvoice.id },
      invoicePayload,
      { upsert: true, new: true },
    );
    if (!result) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Invoice creation failed',
      );
    }

    // send email to user
    if ((subscription?.user as any)?.email) {
      const template = emailTemplate.paymentFailed({
        subject: 'Payment Failed',
        name: (subscription?.user as any)?.name,
        email: (subscription?.user as any)?.email,
        packageName: (subscription?.package as any)?.name,
        billingUrl: stripeInvoice.hosted_invoice_url,
      });

      await emailHelper.sendEmail({
        to: (subscription?.user as any)?.email,
        subject: template.subject,
        html: template.html,
      });
    }
  } catch (error) {
    console.error('Error onInvoicePaymentFailed  ~~ ', error);
  }
};

// on invoice update
const onInvoiceUpdate = async (event: Stripe.Event) => {
  try {
    const stripeInvoice = event.data.object as Stripe.Invoice;
    const stripeSubscriptionId = (stripeInvoice as any).subscription as
      | string
      | null;

    if (!stripeSubscriptionId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Subscription ID not found in invoice',
      );
    }

    // check if subscription exists
    const existingSubscription = await Subscription.exists({
      stripeSubscriptionId: stripeSubscriptionId,
    }).lean();
    if (!existingSubscription) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription not found');
    }

    // DB write: update subscription
    if (
      stripeInvoice.status === 'uncollectible' ||
      stripeInvoice.status === 'void'
    ) {
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: stripeSubscriptionId },
        {
          paymentStatus: PaymentStatus.FAILED,
          status: SubscriptionStatus.PAST_DUE,
          currentPeriodStart: new Date(stripeInvoice.period_start * 1000),
          currentPeriodEnd: new Date(stripeInvoice.period_end * 1000),
        },
        { new: true },
      );

      // DB write: update invoice
      await Invoice.updateMany(
        { stripeInvoiceId: stripeInvoice.id, status: InvoiceStatus.RETRYING },
        {
          status: InvoiceStatus.FAILED,
        },
      );
    }
  } catch (error) {
    console.error('Error onInvoiceUpdate  ~~ ', error);
  }
};

// on refund created
const onRefundCreated = async (event: Stripe.Event) => {
  const refund = event.data.object as Stripe.Refund;
  const invoiceId = refund.metadata?.internalInvoiceId;
  const subscriptionId = refund.metadata?.subscriptionId;

  if (!invoiceId) {
    console.warn(
      `Refund ${refund.id} processed without internalInvoiceId metadata.`,
    );
    return;
  }

  // DB write: update invoice and subscription
  await Invoice.findOneAndUpdate(
    { _id: invoiceId, status: { $ne: InvoiceStatus.REFUNDED } },
    { status: InvoiceStatus.REFUNDED },
  );
  await Subscription.findByIdAndUpdate(
    subscriptionId,
    { status: SubscriptionStatus.CANCELED },
    { new: true },
  );
};

export const StripeWebhookServices = {
  onCustomerSubscriptionCreated,
  onPaymentIntentSucceeded,
  onInvoicePaid,
  onInvoicePaymentFailed,
  onInvoiceUpdate,
  onRefundCreated,
};

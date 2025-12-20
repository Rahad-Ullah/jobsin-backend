import Stripe from 'stripe';
import { stripe } from '../../../config/stripe';
import { Subscription } from '../../modules/subscription/subscription.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import {
  PaymentStatus,
  SubscriptionStatus,
} from '../../modules/subscription/subscription.constants';

const onCheckoutSessionCompleted = async (event: Stripe.Event) => {
  console.log('--> subscription created webhook');
  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId = session.subscription as string;

    if (!session.subscription || !session.customer) return;

    // check session metadata
    if (!session.metadata?.userId || !session.metadata?.packageId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing session metadata');
    }

    // Idempotency guard
    const existing = await Subscription.findOne({
      stripeSubscriptionId: session.subscription as string,
    });
    if (existing) return;

    const stripeSub: Stripe.Subscription = await stripe.subscriptions.retrieve(
      subscriptionId,
      {
        expand: ['items.data.price', 'latest_invoice.lines.data.price'],
      }
    );

    const stripePrice = stripeSub.items.data[0].price;
    const unitAmount = stripePrice.unit_amount! / 100;
    const intervalCount = stripePrice.recurring?.interval_count ?? 1;

    const invoice = stripeSub.latest_invoice as Stripe.Invoice;
    if (!invoice?.lines?.data?.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invoice lines not found');
    }
    const period = invoice.lines.data[0].period;

    // DB write: create subscription
    const payload = {
      user: session.metadata?.userId,
      package: session.metadata?.packageId,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: session.customer as string,
      stripePriceId: stripePrice.id,
      price: unitAmount * intervalCount,
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
        'Subscription creation failed'
      );
    }
  } catch (error) {
    console.error('Error onCheckoutSessionCompleted  ~~ ', error);
    throw error;
  }
};

export const StripeWebhookServices = {
  onCheckoutSessionCompleted,
};

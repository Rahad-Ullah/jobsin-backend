import Stripe from 'stripe';
import { stripe } from '../../../config/stripe';
import QueryBuilder from '../../builder/QueryBuilder';
import { Invoice } from './invoice.model';
import { InvoiceStatus } from './invoice.constants';
import { Subscription } from '../subscription/subscription.model';
import { SubscriptionStatus } from '../subscription/subscription.constants';

// ------------- refund invoice -------------
const refundInvoiceFromDB = async (invoiceId: string, reason: string) => {
  const invoice = await Invoice.findById(invoiceId).lean();
  if (!invoice) throw new Error('Invoice not found');

  const stripeInvoice = (await stripe.invoices.retrieve(
    invoice.stripeInvoiceId,
    {
      expand: ['payment_intent'],
    },
  )) as Stripe.Invoice;

  // Ensure the invoice is actually paid before refunding
  if (stripeInvoice.status !== 'paid') {
    throw new Error(`Invoice is not paid: ${stripeInvoice.status}`);
  }
  // @ts-ignore (Optional: if you want to hide the warning entirely)
  const paymentIntentId = stripeInvoice['payment_intent'] as string;
  if (!paymentIntentId) throw new Error('No payment intent found.');

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: Math.round(invoice.amount * 100),
    metadata: {
      reason,
      internalInvoiceId: invoiceId,
      subscriptionId: invoice.subscription.toString(),
    },
  });

  // update invoice and it's subscription
  await Invoice.findByIdAndUpdate(invoiceId, {
    status: InvoiceStatus.REFUNDED,
  });
  await Subscription.findByIdAndUpdate(
    invoice.subscription,
    { status: SubscriptionStatus.CANCELED },
    { new: true },
  );

  return refund;
};

// ------------- get invoices by user id -------------
const getInvoicesByUserIdFromDB = async (
  userId: string,
  query: Record<string, any>,
) => {
  const invoiceQuery = new QueryBuilder(
    Invoice.find({ user: userId }).populate([
      {
        path: 'user',
        select: 'name email phone address image',
      },
      {
        path: 'subscription',
        select: 'package price status paymentStatus',
        populate: {
          path: 'package',
          select: 'name interval intervalPrice intervalCount',
        },
      },
    ]),
    query,
  )
    .search(['invoiceNumber', 'user.email', 'user.phone'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    invoiceQuery.modelQuery.lean(),
    invoiceQuery.getPaginationInfo(),
  ]);
  return { data, pagination };
};

// ------------- get all invoices -------------
const getAllInvoicesFromDB = async (query: Record<string, any>) => {
  const invoiceQuery = new QueryBuilder(
    Invoice.find().populate([
      {
        path: 'user',
        select: 'name email phone address image',
      },
      {
        path: 'subscription',
        select: 'package price status paymentStatus',
        populate: {
          path: 'package',
          select: 'name interval intervalPrice intervalCount',
        },
      },
    ]),
    query,
  )
    .search(['invoiceNumber', 'user.email', 'user.phone'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    invoiceQuery.modelQuery.lean(),
    invoiceQuery.getPaginationInfo(),
  ]);
  return { data, pagination };
};

export const InvoiceServices = {
  refundInvoiceFromDB,
  getInvoicesByUserIdFromDB,
  getAllInvoicesFromDB,
};

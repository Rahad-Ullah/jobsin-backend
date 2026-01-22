import Stripe from 'stripe';
import { stripe } from '../../../config/stripe';
import QueryBuilder from '../../builder/QueryBuilder';
import { Invoice } from './invoice.model';
import { InvoiceStatus, RefundReason } from './invoice.constants';
import { Subscription } from '../subscription/subscription.model';
import { SubscriptionStatus } from '../subscription/subscription.constants';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

// ------------- refund invoice -------------
const refundInvoiceFromDB = async (invoiceId: string, reason: RefundReason) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new ApiError(StatusCodes.NOT_FOUND, 'Invoice not found');

  if (invoice.status !== InvoiceStatus.PAID)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Only paid invoices can be refunded',
    );

  // create refund in Stripe
  if (invoice.stripeChargeId) {
    await stripe.refunds.create({
      charge: invoice.stripeChargeId!,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });
  } else if (invoice.stripePaymentIntentId) {
    await stripe.refunds.create({
      payment_intent: invoice.stripePaymentIntentId!,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });
  } else {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invoice has no Stripe Charge ID',
    );
  }

  // update invoice and it's subscription
  const result = await Invoice.findByIdAndUpdate(invoiceId, {
    status: InvoiceStatus.REFUNDED,
  });
  await Subscription.findByIdAndUpdate(
    invoice.subscription,
    { status: SubscriptionStatus.CANCELED },
    { new: true },
  );

  return result;
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

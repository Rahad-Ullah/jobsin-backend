import { Schema, model } from 'mongoose';
import { IInvoice, InvoiceModel } from './invoice.interface';
import { InvoiceStatus } from './invoice.constants';

const invoiceSchema = new Schema<IInvoice, InvoiceModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true,
    },
    stripeInvoiceId: {
      type: String,
      required: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
      index: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      required: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice = model<IInvoice, InvoiceModel>('Invoice', invoiceSchema);

import { Model } from 'mongoose';

import { Types } from 'mongoose';
import { InvoiceStatus } from './invoice.constants';

export interface IInvoice {
  user: Types.ObjectId;
  subscription: Types.ObjectId;
  stripeSubscriptionId: string;
  stripeInvoiceId: string;
  stripeCustomerId: string;
  stripePaymentIntentId: string;
  stripeChargeId: string;
  invoiceNumber: string;
  periodStart: Date;
  periodEnd: Date;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  paidAt?: Date | null;
  invoicePdfUrl?: string | null;
  hostedInvoiceUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type InvoiceModel = Model<IInvoice>;

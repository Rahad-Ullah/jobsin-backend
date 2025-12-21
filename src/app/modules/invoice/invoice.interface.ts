import { Model } from 'mongoose';

import { Types } from 'mongoose';
import { InvoiceStatus } from './invoice.constants';

export interface IInvoice {
  user: Types.ObjectId;
  subscription: Types.ObjectId;
  stripeInvoiceId: string;
  stripeSubscriptionId: string;
  periodStart: Date;
  periodEnd: Date;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  paidAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type InvoiceModel = Model<IInvoice>;

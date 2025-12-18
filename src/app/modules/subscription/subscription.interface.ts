import { Model, Types } from 'mongoose';
import { PaymentStatus, SubscriptionStatus } from './subscription.constants';

export interface ISubscription {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  package: Types.ObjectId;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  price: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SubscriptionModel = Model<ISubscription>;

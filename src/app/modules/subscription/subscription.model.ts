import { Schema, model } from 'mongoose';
import { ISubscription, SubscriptionModel } from './subscription.interface';
import { PaymentStatus, SubscriptionStatus } from './subscription.constants';

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
    stripeSubscriptionId: { type: String, required: true },
    stripeCustomerId: { type: String, required: true },
    stripePriceId: { type: String, required: true },
    price: { type: Number, required: true },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Subscription = model<ISubscription, SubscriptionModel>(
  'Subscription',
  subscriptionSchema
);

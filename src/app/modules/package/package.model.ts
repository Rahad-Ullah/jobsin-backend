import { Schema, model } from 'mongoose';
import { IPackage, PackageModel } from './package.interface';
import { PackageInterval } from './package.constants';

const packageSchema = new Schema<IPackage, PackageModel>(
  {
    name: { type: String, required: true },
    interval: {
      type: String,
      enum: Object.values(PackageInterval),
      required: true,
    },
    intervalCount: { type: Number, required: true },
    dailyPrice: { type: Number, required: true },
    intervalPrice: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    benefits: { type: [String], default: [] },
    stripeProductId: { type: String, required: true },
    stripePriceId: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Package = model<IPackage, PackageModel>('Package', packageSchema);

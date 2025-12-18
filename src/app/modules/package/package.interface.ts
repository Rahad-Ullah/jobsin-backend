import { Model, Types } from 'mongoose';
import { PackageInterval } from './package.constants';

export interface IPackage {
  _id: Types.ObjectId;
  name: string;
  interval: PackageInterval;
  intervalCount: number;
  dailyPrice: number;
  intervalPrice: number;
  price: number;
  description: string;
  benefits: string[];
  stripeProductId: string;
  stripePriceId: string;
  isDeleted: boolean;
}

export type PackageModel = Model<IPackage>;

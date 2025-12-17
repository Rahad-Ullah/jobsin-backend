import { Model, Types } from 'mongoose';
import { PackageInterval } from './package.constants';

export interface IPackage {
  _id: Types.ObjectId;
  name: string;
  interval: PackageInterval;
  intervalCount: number;
  unitPrice: number;
  price: number;
  description: string;
  benefits: string[];
  stripeProductId: string;
  stripePriceId: string;
  isDeleted: boolean;
}

export type PackageModel = Model<IPackage>;

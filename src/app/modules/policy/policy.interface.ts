import { Model } from 'mongoose';

export interface IPolicy {
  taxPercentage: number;
}

export type PolicyModel = Model<IPolicy>;

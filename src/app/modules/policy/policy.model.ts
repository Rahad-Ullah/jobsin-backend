import { Schema, model } from 'mongoose';
import { IPolicy, PolicyModel } from './policy.interface';

const policySchema = new Schema<IPolicy, PolicyModel>({
  taxPercentage: { type: Number, default: 0 },
});

export const Policy = model<IPolicy, PolicyModel>('Policy', policySchema);

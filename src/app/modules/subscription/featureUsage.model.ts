import { Schema, Types, model } from 'mongoose';
import { Feature } from './features.enum';

export interface IFeatureUsage {
  user: Types.ObjectId;
  feature: Feature;
  contextId: string;
  count: number;
  resetAt: Date;
}

const FeatureUsageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  feature: { type: String, enum: Object.values(Feature), required: true },
  contextId: { type: String }, // jobId, candidateId, etc.
  count: { type: Number, default: 0 },
  resetAt: { type: Date },
});

export const FeatureUsage = model('FeatureUsage', FeatureUsageSchema);

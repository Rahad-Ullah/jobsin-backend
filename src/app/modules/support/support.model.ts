import { Schema, model } from 'mongoose';
import { ISupport, SupportModel } from './support.interface';
import { SupportStatus } from './support.constants';

const supportSchema = new Schema<ISupport, SupportModel>(
  {
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    message: { type: String, required: true },
    attachment: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(SupportStatus),
      default: SupportStatus.PENDING,
    },
  },
  { timestamps: true }
);

export const Support = model<ISupport, SupportModel>('Support', supportSchema);

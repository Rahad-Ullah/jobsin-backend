import { Schema, model } from 'mongoose';
import { IVerification, VerificationModel } from './verification.interface';
import { VerificationStatus } from './verification.constants';

const verificationSchema = new Schema<IVerification, VerificationModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    documents: { type: [String], default: [] },
    status: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add schema-level validation for updates
verificationSchema.pre(
  ['findOneAndUpdate', 'updateOne', 'updateMany'],
  function () {
    this.setOptions({ runValidators: true });
  }
);

export const Verification = model<IVerification, VerificationModel>(
  'Verification',
  verificationSchema
);

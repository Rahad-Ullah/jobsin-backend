import { Schema, model } from 'mongoose';
import { IDrive, DriveModel } from './drive.interface';

const driveSchema = new Schema<IDrive, DriveModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, index: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

// compound index for unique file name for a user to prevent duplicates
driveSchema.index({ user: 1, name: 1 }, { unique: true });

export const Drive = model<IDrive, DriveModel>('Drive', driveSchema);

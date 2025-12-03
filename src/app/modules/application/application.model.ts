import { Schema, model } from 'mongoose';
import { IApplication, ApplicationModel } from './application.interface';
import { ApplicationStatus } from './application.constants';

const applicationSchema = new Schema<IApplication, ApplicationModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    resumeUrl: { type: String, default: '' },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume', default: null },
    expectedSalary: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Application = model<IApplication, ApplicationModel>(
  'Application',
  applicationSchema
);

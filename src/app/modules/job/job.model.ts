import { Schema, model } from 'mongoose';
import { IJob, JobModel } from './job.interface';
import {
  ExperienceLevel,
  JobStatus,
  JobType,
  RepeatType,
  SalaryType,
} from './job.constants';

// Notification Settings sub-schema
const notificationSettingsSchema = new Schema(
  {
    pushNotification: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: false },
    repeat: {
      type: String,
      enum: Object.values(RepeatType),
      default: RepeatType.DAILY,
    },
    email: { type: String, default: '' },
  },
  { _id: false }
);

// Job schema
const jobSchema = new Schema<IJob, JobModel>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    jobType: {
      type: String,
      enum: Object.values(JobType),
      required: true,
    },
    experience: {
      type: String,
      enum: Object.values(ExperienceLevel),
      required: true,
    },
    deadline: { type: Date, required: true },
    salaryType: {
      type: String,
      enum: Object.values(SalaryType),
      required: true,
    },
    salaryAmount: { type: Number, required: true },
    description: { type: String, required: true },
    responsibilities: [{ type: String }, { required: true }],
    qualifications: [{ type: String }, { required: true }],
    aboutCompany: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.OPEN,
    },
    isHiringRequest: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    notificationSettings: notificationSettingsSchema,
  },
  { timestamps: true }
);

export const Job = model<IJob, JobModel>('Job', jobSchema);

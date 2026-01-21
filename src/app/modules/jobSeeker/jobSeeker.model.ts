import { Schema, Types, model } from 'mongoose';
import { IJobSeeker, JobSeekerModel } from './jobSeeker.interface';
import { RepeatType, SalaryType } from './jobSeeker.constants';

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
    lastSentAt: { type: Date, default: null },
    email: { type: String, default: '' },
  },
  { _id: false },
);

// experience sub-schema
const experienceSchema = new Schema(
  {
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 },
    salaryType: {
      type: String,
      enum: Object.values(SalaryType),
      required: true,
    },
    salaryAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const jobSeekerSchema = new Schema<IJobSeeker, JobSeekerModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    overview: { type: String, default: '' },
    about: { type: String, default: '' },
    experiences: [experienceSchema, { default: [] }],
    resumeUrl: { type: String, default: '' },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume', default: null },
    attachments: [{ type: String }, { default: [] }],
    isProfileVisible: { type: Boolean, default: true },
    
  },
  { timestamps: true }
);

// check if employer profile is fulfilled
jobSeekerSchema.statics.isProfileFulfilled = async (userId: Types.ObjectId) => {
  const jobSeeker = await JobSeeker.findOne({ user: userId });
  const arr = [
    jobSeeker?.overview,
    jobSeeker?.about,
    jobSeeker?.experiences?.length,
    jobSeeker?.resumeUrl,
    jobSeeker?.attachments?.length,
  ];
  for (let item of arr) {
    if (!item) {
      return false;
    }
  }
  return true;
};

export const JobSeeker = model<IJobSeeker, JobSeekerModel>(
  'JobSeeker',
  jobSeekerSchema
);

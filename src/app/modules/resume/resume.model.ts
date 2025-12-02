import { Schema, model } from 'mongoose';
import { IResume, ResumeModel } from './resume.interface';

// Education sub-schema
const educationSchema = new Schema(
  {
    degree: { type: String, required: true },
    institute: { type: String, required: true },
    grade: { type: String, required: true },
    year: { type: Number, required: true },
  },
  { _id: false }
);

// Experience sub-schema
const experienceSchema = new Schema(
  {
    designation: { type: String, required: true },
    company: { type: String, required: true },
    isCurrentlyWorking: { type: Boolean, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    workDetails: { type: String, required: true },
    portfolioUrls: [{ type: String }, { default: [] }],
  },
  { _id: false }
);

// License sub-schema
const licenseSchema = new Schema(
  {
    carsAndMotorcycles: [{ type: String }, { default: [] }],
    busesAndAgriculture: [{ type: String }, { default: [] }],
    trucks: [{ type: String }, { default: [] }],
  },
  { _id: false }
);

// Personal Info sub-schema
const personalInfoSchema = new Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    dob: { type: Date, default: null },
    image: { type: String, default: '' },
    presentAddress: { type: String, default: '' },
    permanentAddress: { type: String, default: '' },
    aboutMe: { type: String, default: '' },
  },
  { _id: false }
);

const resumeSchema = new Schema<IResume, ResumeModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    personalInfo: personalInfoSchema,
    educations: [educationSchema],
    experiences: [experienceSchema],
    license: licenseSchema,
    skills: [{ type: String, default: [] }],
    extraActivities: [{ type: String, default: [] }],
    hobbies: [{ type: String, default: [] }],
  },
  { timestamps: true }
);

export const Resume = model<IResume, ResumeModel>('Resume', resumeSchema);

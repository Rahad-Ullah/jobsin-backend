import { Schema, model } from 'mongoose';
import { IJobSeeker, JobSeekerModel } from './jobSeeker.interface';

const jobSeekerSchema = new Schema<IJobSeeker, JobSeekerModel>({
  // Define schema fields here
});

export const JobSeeker = model<IJobSeeker, JobSeekerModel>(
  'JobSeeker',
  jobSeekerSchema
);
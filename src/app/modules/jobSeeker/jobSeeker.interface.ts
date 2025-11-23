import { Model, Types } from 'mongoose';
import { SalaryType } from './jobSeeker.constants';

// Work Experience sub-document
export interface IExperience {
  category: string;
  subCategory: string;
  experience: number; // years
  salaryType: SalaryType;
  salaryAmount: number;
}

// Job Seeker entity
export interface IJobSeeker {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  overview: string;
  about: string;
  experiences: IExperience[];
  resumeUrl?: string;
  resume?: Types.ObjectId;
  attachments: string[];
}

export type JobSeekerModel = Model<IJobSeeker>;

import { Model, Types } from 'mongoose';
import { RepeatType, SalaryType } from './jobSeeker.constants';

export interface INotificationSettings {
  pushNotification: boolean;
  emailNotification: boolean;
  repeat: RepeatType;
  lastSentAt: Date;
  email: string;
}

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
  isProfileVisible: boolean;
  
}

export type JobSeekerModel = {
  isProfileFulfilled(userId: Types.ObjectId): boolean;
} & Model<IJobSeeker>;

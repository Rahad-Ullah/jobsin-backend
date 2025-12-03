import { Model } from 'mongoose';

import { Types } from 'mongoose';
import {
  ExperienceLevel,
  JobStatus,
  JobType,
  RepeatType,
  SalaryType,
} from './job.constants';

export interface INotificationSettings {
  pushNotification: boolean;
  emailNotification: boolean;
  repeat: RepeatType;
  email: string;
}

export interface IJob {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  category: string;
  subCategory: string;
  jobType: JobType;
  experience: ExperienceLevel;
  deadline: Date;
  salaryType: SalaryType;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  aboutCompany: string;
  status: JobStatus;
  isDeleted: boolean;
  notificationSettings: INotificationSettings;
}

export type JobModel = Model<IJob>;

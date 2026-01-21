import { Model } from 'mongoose';

import { Types } from 'mongoose';
import {
  ExperienceLevel,
  JobStatus,
  JobType,
  SalaryType,
} from './job.constants';

export interface IJob {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  category: string;
  subCategory: string;
  location: {
    type: 'Point';
    coordinates: number[];
  };
  jobType: JobType;
  experience: ExperienceLevel;
  deadline: Date;
  salaryType: SalaryType;
  salaryAmount: number;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  aboutCompany: string;
  status: JobStatus;
  isHiringRequest: boolean;
  isDeleted: boolean;
}

export type JobModel = Model<IJob>;

import { Model, Types } from 'mongoose';
import { ApplicationStatus } from './application.constants';
import { SalaryType } from '../job/job.constants';

export interface IApplication {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  job: Types.ObjectId;
  resumeUrl: string;
  resume: Types.ObjectId;
  salaryType: SalaryType;
  expectedSalary: number;
  status: ApplicationStatus;
  isDeleted: boolean;
}

export type ApplicationModel = Model<IApplication>;

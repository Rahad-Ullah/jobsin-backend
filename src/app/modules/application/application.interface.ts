import { Model, Types } from 'mongoose';
import { ApplicationStatus } from './application.constants';

export interface IApplication {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  job: Types.ObjectId;
  resumeUrl: string;
  resume: Types.ObjectId;
  expectedSalary: number;
  status: ApplicationStatus;
  isDeleted: boolean;
}

export type ApplicationModel = Model<IApplication>;

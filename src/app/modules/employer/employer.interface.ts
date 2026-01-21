import { Model, Types } from 'mongoose';
import { RepeatType } from './employer.constant';

export interface INotificationSettings {
  pushNotification: boolean;
  emailNotification: boolean;
  repeat: RepeatType;
  email: string;
}

export type IEmployer = {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  businessCategory: string;
  legalForm: string;
  taxNo: string;
  deNo: string;
  whatsApp: string;
  about: string;
  notificationSettings: INotificationSettings;
};

export type EmployerModel = {
  isProfileFulfilled(userId: Types.ObjectId): boolean;
} & Model<IEmployer>;

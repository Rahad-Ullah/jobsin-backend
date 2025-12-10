import { Model, Types } from 'mongoose';
import { SupportStatus } from './support.constants';

export interface ISupport {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  message: string;
  attachment: string;
  status: SupportStatus;
}

export type SupportModel = Model<ISupport>;

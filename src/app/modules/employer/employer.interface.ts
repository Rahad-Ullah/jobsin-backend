import { Model, Types } from 'mongoose';

export type IEmployer = {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  businessCategory: string;
  legalForm: string;
  taxNo: string;
  deNo: string;
  whatsApp: string;
  about: string;
};

export type EmployerModel = Model<IEmployer>;

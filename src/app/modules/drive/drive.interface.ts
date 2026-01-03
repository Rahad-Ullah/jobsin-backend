import { Model, Types } from 'mongoose';

export interface IDrive {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DriveModel = Model<IDrive>;

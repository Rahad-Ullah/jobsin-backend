import { Model, Types } from 'mongoose';

export interface IWorker {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  isDeleted: boolean;
}

export type WorkerModel = Model<IWorker>;

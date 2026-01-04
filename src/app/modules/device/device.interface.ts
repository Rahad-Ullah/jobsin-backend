import { Model, Types } from 'mongoose';

export interface IDevice {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  ip: string;
  model: string;
  os: string;
  loginAt: Date;
}

export type DeviceModel = Model<IDevice>;

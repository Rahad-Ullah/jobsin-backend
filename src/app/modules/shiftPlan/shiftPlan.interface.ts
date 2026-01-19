import { Model, Types } from 'mongoose';
import { ShiftType } from './shiftPlan.constants';

export interface IPlan {
  shift: ShiftType;
  startTime: string;
  endTime: string;
  days: Date[];
  tasks: string[];
  remarks: string;
}

export interface IShiftPlan {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  worker: Types.ObjectId;
  plans: IPlan[];
}

export type ShiftPlanModel = Model<IShiftPlan>;

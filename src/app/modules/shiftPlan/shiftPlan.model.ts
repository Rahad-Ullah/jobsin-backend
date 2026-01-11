import { Schema, model } from 'mongoose';
import { IShiftPlan, ShiftPlanModel } from './shiftPlan.interface';
import { ShiftType } from './shiftPlan.constants';

const shiftPlanSchema = new Schema<IShiftPlan, ShiftPlanModel>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  shift: { type: String, enum: Object.values(ShiftType), required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  days: { type: [Date], required: true },
  tasks: { type: [String], required: true },
  remarks: { type: String, default: '' },
});

export const ShiftPlan = model<IShiftPlan, ShiftPlanModel>(
  'ShiftPlan',
  shiftPlanSchema
);

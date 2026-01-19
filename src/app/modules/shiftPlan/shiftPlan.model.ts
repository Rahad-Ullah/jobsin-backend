import { Schema, model } from 'mongoose';
import { IPlan, IShiftPlan, ShiftPlanModel } from './shiftPlan.interface';
import { ShiftType } from './shiftPlan.constants';

const planSchema = new Schema<IPlan>({
  shift: { type: String, enum: Object.values(ShiftType), required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  days: { type: [Date], required: true },
  tasks: { type: [String], required: true },
  remarks: { type: String, default: '' },
});

const shiftPlanSchema = new Schema<IShiftPlan, ShiftPlanModel>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
    plans: [planSchema, { default: [] }],
  },
  { timestamps: true },
);

shiftPlanSchema.index({ author: 1, days: 1 });

export const ShiftPlan = model<IShiftPlan, ShiftPlanModel>(
  'ShiftPlan',
  shiftPlanSchema
);

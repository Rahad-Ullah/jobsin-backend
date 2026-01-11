import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IShiftPlan } from './shiftPlan.interface';
import { ShiftPlan } from './shiftPlan.model';
import { Worker } from '../worker/worker.model';

// ------------ create shift plan --------------
const createShiftPlanToDB = async (
  payload: IShiftPlan
): Promise<IShiftPlan> => {
  // check if the worker exists
  const existingWorker = await Worker.exists({ _id: payload.worker });
  if (!existingWorker) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Worker not found');
  }

  // check if the days are already booked
  const existingShift = await ShiftPlan.exists({ days: { $in: payload.days } });
  if (existingShift) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Days are already booked');
  }

  const result = await ShiftPlan.create(payload);
  return result;
};

export const ShiftPlanServices = {
  createShiftPlanToDB,
};

import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IShiftPlan } from './shiftPlan.interface';
import { ShiftPlan } from './shiftPlan.model';
import { Worker } from '../worker/worker.model';
import QueryBuilder from '../../builder/QueryBuilder';

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
  const existingShift = await ShiftPlan.exists({
    days: { $in: payload.days },
    author: payload.author,
  });
  if (existingShift) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Days are already booked');
  }

  const result = await ShiftPlan.create(payload);
  return result;
};

// ------------ update shift plan --------------
const updateShiftPlan = async (
  id: string,
  payload: Partial<IShiftPlan>,
  author: string
) => {
  // check if the shift plan exists
  const existingShiftPlan = await ShiftPlan.exists({ _id: id });
  if (!existingShiftPlan) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Shift plan not found');
  }

  // check if the worker exists
  const existingWorker = await Worker.exists({ _id: payload.worker });
  if (!existingWorker) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Worker not found');
  }

  // check if the days are already booked
  const isAlreadyBooked = await ShiftPlan.exists({
    days: { $in: payload.days },
    author: author,
    _id: { $ne: id },
  });
  if (isAlreadyBooked) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Days are already booked');
  }

  const result = await ShiftPlan.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// ------------- delete shift plan --------------
const deleteShiftPlan = async (id: string): Promise<IShiftPlan | null> => {
  // check if the shift plan exists
  const existingShiftPlan = await ShiftPlan.exists({ _id: id });
  if (!existingShiftPlan) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Shift plan not found');
  }

  const result = await ShiftPlan.findByIdAndDelete(id);
  return result;
};

// ------------- get shift plan by author id -------------
const getShiftPlanByAuthorId = async (
  authorId: string,
  query: Record<string, unknown>
) => {
  const filter: Record<string, any> = { author: authorId };
  if (query.startDate) {
    filter.days = { $elemMatch: { $gte: new Date(query.startDate as string) } };
  }

  if (query.endDate) {
    filter.days = { $elemMatch: { $lte: new Date(query.endDate as string) } };
  }

  const planQuery = new QueryBuilder(
    ShiftPlan.find(filter).populate('worker'),
    query
  )
    .filter(['startDate', 'endDate'])
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    planQuery.modelQuery.lean(),
    planQuery.getPaginationInfo(),
  ]);
  return { data, pagination };
};

export const getShiftPlanById = async (
  id: string
): Promise<IShiftPlan | null> => {
  const result = await ShiftPlan.findById(id).populate('worker');
  return result;
};

export const ShiftPlanServices = {
  createShiftPlanToDB,
  updateShiftPlan,
  deleteShiftPlan,
  getShiftPlanByAuthorId,
  getShiftPlanById,
};

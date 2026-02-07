import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IShiftPlan } from './shiftPlan.interface';
import { ShiftPlan } from './shiftPlan.model';
import { Worker } from '../worker/worker.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { IWorker } from '../worker/worker.interface';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';

// ------------ create shift plan --------------
const createShiftPlanToDB = async (
  payload: IShiftPlan,
): Promise<IShiftPlan> => {
  // check if the worker exists
  const existingWorker = await Worker.exists({ _id: payload.worker });
  if (!existingWorker) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Worker not found');
  }

  const result = await ShiftPlan.create(payload);
  return result;
};

// ------------ update shift plan --------------
const updateShiftPlan = async (
  id: string,
  payload: Partial<IShiftPlan>,
  author: string,
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

// ------------- send shift plan to worker --------------
const sendShiftPlanToWorker = async (shiftPlanId: string) => {
  // check if plan exists
  const existingPlan =
    await ShiftPlan.findById(shiftPlanId).populate('author worker');
  if (!existingPlan) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Shift plan not found');
  }

  const worker = existingPlan.worker as any as IWorker;

  // send mail
  if (worker.email) {
    const template = emailTemplate.shiftPlanToWorker(worker, existingPlan);
    await emailHelper.sendEmail({
      to: worker.email,
      subject: template.subject,
      html: template.html,
    });
  }
};

// ------------- get shift plan by author id -------------
const getShiftPlanByAuthorId = async (
  authorId: string,
  query: Record<string, unknown>,
) => {
  const filter: Record<string, any> = { author: authorId };

  const elemMatchConditions: Record<string, any> = {};

  if (query.startDate || query.endDate) {
    const dateQuery: Record<string, any> = {};
    
    if (query.startDate) {
      const start = new Date(query.startDate as string);
      start.setUTCHours(0, 0, 0, 0);
      dateQuery.$gte = start;
    }

    if (query.endDate) {
      const end = new Date(query.endDate as string);
      end.setUTCHours(23, 59, 59, 999);
      dateQuery.$lte = end;
    }

    elemMatchConditions.days = dateQuery;
  }

  if (query.shift) {
    elemMatchConditions.shift = query.shift;
  }

  if (Object.keys(elemMatchConditions).length > 0) {
    filter.plans = { $elemMatch: elemMatchConditions };
  }

  const planQuery = new QueryBuilder(
    ShiftPlan.find(filter).populate('worker'),
    query,
  )
    .filter(['startDate', 'endDate', 'shift'])
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
  id: string,
): Promise<IShiftPlan | null> => {
  const result = await ShiftPlan.findById(id).populate('worker');
  return result;
};

export const ShiftPlanServices = {
  createShiftPlanToDB,
  updateShiftPlan,
  deleteShiftPlan,
  sendShiftPlanToWorker,
  getShiftPlanByAuthorId,
  getShiftPlanById,
};

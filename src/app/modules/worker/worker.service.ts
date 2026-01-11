import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IWorker } from './worker.interface';
import { Worker } from './worker.model';

// --------------- create worker ---------------
const createWorkerToDB = async (
  payload: Partial<IWorker>
): Promise<IWorker> => {
  // check if worker already exists
  const existingWorker = await Worker.exists({ email: payload.email });
  if (existingWorker) {
    throw new ApiError(StatusCodes.CONFLICT, 'Worker already exists');
  }

  const result = await Worker.create(payload);
  return result;
};

export const WorkerServices = {
  createWorkerToDB,
};

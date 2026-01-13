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

// -------------- update worker --------------
const updateWorker = async (id: string, payload: Partial<IWorker>) => {
  // check if the worker exists
  const existingWorker = await Worker.exists({ _id: id });
  if (!existingWorker) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Worker not found');
  }

  const result = await Worker.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// -------------- delete worker --------------
const deleteWorker = async (id: string): Promise<IWorker | null> => {
  // check if the worker exists
  const existingWorker = await Worker.exists({ _id: id });
  if (!existingWorker) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Worker not found');
  }
  
  const result = await Worker.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

// ------------- get workers by employer id --------------
const getWorkersByEmployerId = async (id: string): Promise<IWorker[]> => {
  const result = await Worker.find({ author: id, isDeleted: false }).lean();
  return result;
}

export const WorkerServices = {
  createWorkerToDB,
  updateWorker,
  deleteWorker,
  getWorkersByEmployerId,
};

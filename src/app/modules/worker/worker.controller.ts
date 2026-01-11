import { Request, Response } from 'express';
import { WorkerServices } from './worker.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create worker
const createWorker = catchAsync(async (req: Request, res: Response) => {
  const result = await WorkerServices.createWorkerToDB({
    ...req.body,
    author: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Worker created successfully',
    data: result,
  });
});

export const WorkerController = {
  createWorker,
};

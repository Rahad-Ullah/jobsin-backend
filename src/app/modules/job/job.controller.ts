import { Request, Response, NextFunction } from 'express';
import { JobServices } from './job.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create job post
const createJob = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.createJob({
    ...req.body,
    author: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Job created successfully',
    data: result,
  });
});

// update job
const updateJob = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.updateJob(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Job updated successfully',
    data: result,
  });
});

// delete job
const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.deleteJob(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Job deleted successfully',
    data: result,
  });
});

export const JobController = {
  createJob,
  updateJob,
  deleteJob,
};
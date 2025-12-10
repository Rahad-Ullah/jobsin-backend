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

// get single job by id
const getSingleJobById = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.getSingleJobById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Job retrieved successfully',
    data: result,
  });
})

// get jobs by employer id
const getJobsByEmployerId = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.getJobsByEmployerId(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Jobs retrieved successfully',
    data: result,
  });
})

// get my jobs
const getMyJobs = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.getJobsByEmployerId(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Jobs retrieved successfully',
    data: result,
  });
})

// get all jobs
const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.getAllJobs(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Jobs retrieved successfully',
    data: result?.data,
    pagination: result?.pagination,
  });
})

export const JobController = {
  createJob,
  updateJob,
  deleteJob,
  getSingleJobById,
  getJobsByEmployerId,
  getMyJobs,
  getAllJobs,
};
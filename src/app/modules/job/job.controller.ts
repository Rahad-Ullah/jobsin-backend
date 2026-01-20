import { Request, Response } from 'express';
import { JobServices } from './job.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { LimitationServices } from '../limitation/limitation.service';

// create job post
const createJob = catchAsync(async (req: Request, res: Response) => {
  // check user job limit
  await LimitationServices.onCreateJob(req.user.id);

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

// hiring post to admin
const sendHiringPostToAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await JobServices.sendHiringPostToAdmin(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Hiring post sent successfully',
      data: result,
    });
  },
);

// get single job by id
const getSingleJobById = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.getSingleJobById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Job retrieved successfully',
    data: result,
  });
});

// get jobs by employer id
const getJobsByEmployerId = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.getJobsByEmployerId(
    req.params.id,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Jobs retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

// get my jobs
const getMyJobs = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.getJobsByEmployerId(req.user.id, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Jobs retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

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
});

export const JobController = {
  createJob,
  updateJob,
  deleteJob,
  sendHiringPostToAdmin,
  getSingleJobById,
  getJobsByEmployerId,
  getMyJobs,
  getAllJobs,
};

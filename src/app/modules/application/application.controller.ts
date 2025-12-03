import { Request, Response, NextFunction } from 'express';
import { ApplicationServices } from './application.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

// create application
const createApplication = catchAsync(async (req: Request, res: Response) => {
  const resume = getSingleFilePath(req.files, 'doc');

  const result = await ApplicationServices.createApplicationToDB({
    ...req.body,
    user: req.user.id,
    resumeUrl: resume,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Application created successfully',
    data: result,
  });
});

// update application
const updateApplication = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationServices.updateApplicationToDB(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Application updated successfully',
    data: result,
  });
});

// get applications by job id
const getApplicationsByJobId = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationServices.getApplicationsByJobId(req.params.id, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Applications retrieved successfully',
    data: result?.data,
    pagination: result?.pagination,
  });
});

export const ApplicationController = {
  createApplication,
  updateApplication,
  getApplicationsByJobId,
};
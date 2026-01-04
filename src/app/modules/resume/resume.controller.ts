import { Request, Response } from 'express';
import { ResumeServices } from './resume.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

// create/update resume
const createUpdateResume = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  const payload = {
    ...req.body,
    user: req.user.id,
    image,
  };

  const result = await ResumeServices.createUpdateResumeToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Resume updated successfully',
    data: result,
  });
});

// get single resume by user id
const getResumeByUserId = catchAsync(async (req: Request, res: Response) => {
  const result = await ResumeServices.getResumeByUserId(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Resume retrieved successfully',
    data: result,
  });
});

// get my resume
const getMyResume = catchAsync(async (req: Request, res: Response) => {
  const result = await ResumeServices.getResumeByUserId(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Resume retrieved successfully',
    data: result,
  });
});

export const ResumeController = {
  createUpdateResume,
  getResumeByUserId,
  getMyResume,
};
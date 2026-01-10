import { Request, Response, NextFunction } from 'express';
import { JobSeekerServices } from './jobSeeker.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from '../../../shared/getFilePath';
import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '../user/user.constant';

// update job seeker
const updateJobSeeker = catchAsync(async (req: Request, res: Response) => {
  const resumeUrl = getSingleFilePath(req.files, 'doc');
  const attachments = getMultipleFilesPath(req.files, 'image');
  const payload = { ...req.body, resumeUrl, attachments };

  const result = await JobSeekerServices.updateJobSeekerByUserId(
    req.user.id,
    payload
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job seeker updated successfully',
    data: result,
  });
});

// get my job seeker profile
const getMyJobSeeker = catchAsync(async (req: Request, res: Response) => {
  const result = await JobSeekerServices.getJobSeekerByUserId(req.user.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job seeker retrieved successfully',
    data: result,
  });
});

// get job seeker by user id
const getJobSeekerByUserId = catchAsync(async (req: Request, res: Response) => {
  let result;
  if (req.user.role === USER_ROLES.EMPLOYER) {
    result = await JobSeekerServices.getJobSeekerWithPrivacy(
      req.params.id,
      req.user.id
    );
  } else {
    result = await JobSeekerServices.getJobSeekerByUserId(req.params.id);
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job seeker retrieved successfully',
    data: result,
  });
});

export const JobSeekerController = {
  updateJobSeeker,
  getMyJobSeeker,
  getJobSeekerByUserId,
};
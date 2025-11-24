import { Request, Response, NextFunction } from 'express';
import { JobSeekerServices } from './jobSeeker.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from '../../../shared/getFilePath';

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

export const JobSeekerController = {
  updateJobSeeker,
};
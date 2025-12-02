import { Request, Response, NextFunction } from 'express';
import { ResumeServices } from './resume.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create/update resume
const createUpdateResume = catchAsync(async (req: Request, res: Response) => {
  const result = await ResumeServices.createUpdateResumeToDB({
    ...req.body,
    user: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Resume updated successfully',
    data: result,
  });
});

export const ResumeController = {
  createUpdateResume,
};
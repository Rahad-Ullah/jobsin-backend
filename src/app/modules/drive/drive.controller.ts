import { Request, Response, NextFunction } from 'express';
import { DriveServices } from './drive.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

// create drive
const createDrive = catchAsync(async (req: Request, res: Response) => {
  const filePath = getSingleFilePath(req.files, 'doc');
  const result = await DriveServices.createDriveToDB({
    ...req.body,
    user: req.user.id,
    url: filePath,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Drive created successfully',
    data: result,
  });
});

// update drive
const updateDrive = catchAsync(async (req: Request, res: Response) => {
  const result = await DriveServices.updateDriveToDB(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Drive updated successfully',
    data: result,
  });
});

export const DriveController = {
  createDrive,
  updateDrive,
};

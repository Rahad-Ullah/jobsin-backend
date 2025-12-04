import { Request, Response, NextFunction } from 'express';
import { VerificationServices } from './verification.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getMultipleFilesPath } from '../../../shared/getFilePath';

// create verification
export const createVerification = catchAsync(
  async (req: Request, res: Response) => {
    const documents = getMultipleFilesPath(req.files, 'doc');

    const result = await VerificationServices.createVerificationToDB({
      ...req.body,
      documents,
      user: req.user.id,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Verification created successfully',
      data: result,
    });
  }
);

// update verification
export const updateVerification = catchAsync(
  async (req: Request, res: Response) => {
    const result = await VerificationServices.updateVerificationToDB(
      req.params.id,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Verification updated successfully',
      data: result,
    });
  }
);

export const VerificationController = {
  createVerification,
  updateVerification,
};
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

// get my verification
export const getMyVerifications = catchAsync(
  async (req: Request, res: Response) => {
    const result = await VerificationServices.getVerificationByUserId(
      req.user.id
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Verification retrieved successfully',
      data: result,
    });
  }
);

// get all verifications
export const getAllVerifications = catchAsync(
  async (req: Request, res: Response) => {
    const result = await VerificationServices.getAllVerifications(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Verifications retrieved successfully',
      data: result?.data,
      pagination: result?.pagination,
    });
  }
);

export const VerificationController = {
  createVerification,
  updateVerification,
  getMyVerifications,
  getAllVerifications,
};
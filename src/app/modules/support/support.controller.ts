import { Request, Response, NextFunction } from 'express';
import { SupportServices } from './support.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create support
const createSupport = catchAsync(async (req: Request, res: Response) => {
  // const result = await SupportServices.createSupportToDB(req.body);
  throw new Error('Not implemented');

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Support created successfully',
    data: null,
  });
});

export const SupportController = {
  createSupport,
};
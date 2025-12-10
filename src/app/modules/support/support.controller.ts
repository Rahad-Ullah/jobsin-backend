import { Request, Response, NextFunction } from 'express';
import { SupportServices } from './support.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

// create support
const createSupport = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  const result = await SupportServices.createSupportToDB({
    ...req.body,
    attachment: image,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Support created successfully',
    data: result,
  });
});

// update support
const updateSupport = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportServices.updateSupportToDB(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Support updated successfully',
    data: result,
  });
});

export const SupportController = {
  createSupport,
  updateSupport,
};
import { Request, Response } from 'express';
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

// create for logged in user
const createSupportForLoggedInUser = catchAsync(
  async (req: Request, res: Response) => {
    const image = getSingleFilePath(req.files, 'image');
    const result = await SupportServices.createSupportForLoggedInUser(req.user.id, {
      ...req.body,
      attachment: image,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Support created successfully',
      data: result,
    });
  }
);

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

// get single by id
const getSingleSupportById = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportServices.getSupportByIdFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Support retrieved successfully',
    data: result,
  });
});

// get all supports
const getAllSupports = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportServices.getAllSupportsFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Supports retrieved successfully',
    data: result?.data,
    pagination: result?.pagination,
  });
});

export const SupportController = {
  createSupport,
  createSupportForLoggedInUser,
  updateSupport,
  getSingleSupportById,
  getAllSupports,
};

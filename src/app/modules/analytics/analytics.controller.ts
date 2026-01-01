import { Request, Response, NextFunction } from 'express';
import { AnalyticsServices } from './analytics.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// get overview
const getOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getOverview();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Analytics retrieved successfully',
    data: result,
  });
});

export const AnalyticsController = {
  getOverview,
};

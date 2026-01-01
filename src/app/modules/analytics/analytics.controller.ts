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

// get yearly user growth
const getYearlyUserGrowth = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getYearlyUserGrowth(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Analytics retrieved successfully',
    data: result,
  });
});

// get monthly subscribers growth
const getMonthlySubscribersGrowth = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getMonthlySubscribersGrowth(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Analytics retrieved successfully',
    data: result,
  });
});

export const AnalyticsController = {
  getOverview,
  getYearlyUserGrowth,
  getMonthlySubscribersGrowth,
};

import { Request, Response, NextFunction } from 'express';
import { PackageServices } from './package.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { PackageInterval } from './package.constants';

// create package
const createPackage = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  // calculate interval price
  if (payload.interval === PackageInterval.DAY) {
    payload.intervalPrice = payload.dailyPrice * 1;
  } else if (payload.interval === PackageInterval.WEEK) {
    payload.intervalPrice = payload.dailyPrice * 7;
  } else if (payload.interval === PackageInterval.MONTH) {
    payload.intervalPrice = payload.dailyPrice * 30;
  }

  const result = await PackageServices.createPackageToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package created successfully',
    data: result,
  });
});

export const PackageController = {
  createPackage,
};
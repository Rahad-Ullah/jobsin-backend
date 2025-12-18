import { Request, Response, NextFunction } from 'express';
import { PackageServices } from './package.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { PackageInterval } from './package.constants';
import calculateIntervalPrice from '../../../util/calculateIntervalPrice';

// create package
const createPackage = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  // calculate interval price
  payload.intervalPrice = calculateIntervalPrice(
    payload.interval as PackageInterval,
    payload.dailyPrice
  );

  const result = await PackageServices.createPackageToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package created successfully',
    data: result,
  });
});

// update package
const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  // calculate interval price
  if (payload.interval && payload.dailyPrice) {
    payload.intervalPrice = calculateIntervalPrice(
      payload.interval as PackageInterval,
      payload.dailyPrice
    );
  }

  const result = await PackageServices.updatePackageInDB(
    req.params.id,
    payload
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package updated successfully',
    data: result,
  });
});

// delete package
const deletePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageServices.deletePackageFromDB(req.params.id, true);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package deleted successfully',
    data: result,
  });
});

// get all packages
const getAllPackages = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageServices.getAllPackagesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Packages retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const PackageController = {
  createPackage,
  updatePackage,
  deletePackage,
  getAllPackages,
};
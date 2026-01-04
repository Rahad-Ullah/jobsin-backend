import { Request, Response, NextFunction } from 'express';
import { DeviceServices } from './device.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create device
const createDevice = catchAsync(async (req: Request, res: Response) => {
  const result = await DeviceServices.createDeviceToDB({
    ...req.body,
    user: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Device created successfully',
    data: result,
  });
});

// get devices
const getDevices = catchAsync(async (req: Request, res: Response) => {
  const result = await DeviceServices.getDevicesByUserId(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Devices retrieved successfully',
    data: result,
  });
});

export const DeviceController = {
  createDevice,
  getDevices,
};
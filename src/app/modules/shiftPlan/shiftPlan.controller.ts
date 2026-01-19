import { Request, Response } from 'express';
import { ShiftPlanServices } from './shiftPlan.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create shift plan
const createShiftPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftPlanServices.createShiftPlanToDB({
    ...req.body,
    author: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Shift plan created successfully',
    data: result,
  });
});

// update shift plan
const updateShiftPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftPlanServices.updateShiftPlan(req.params.id, req.body, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Shift plan updated successfully',
    data: result,
  });
});

// delete shift plan
const deleteShiftPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftPlanServices.deleteShiftPlan(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Shift plan deleted successfully',
    data: result,
  });
});

// send shift plan to worker
const sendShiftPlanToWorker = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftPlanServices.sendShiftPlanToWorker(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Shift plan sent to worker successfully',
    data: result,
  });
});

// get shift plan by author id
const getShiftPlanByAuthorId = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftPlanServices.getShiftPlanByAuthorId(req.user.id, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Shift plan retrieved successfully',
    data: result?.data,
    pagination: result?.pagination,
  });
});

// get single shift plan by id
const getSingleShiftPlanById = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftPlanServices.getShiftPlanById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Shift plan retrieved successfully',
    data: result,
  });
});

export const ShiftPlanController = {
  createShiftPlan,
  updateShiftPlan,
  deleteShiftPlan,
  sendShiftPlanToWorker,
  getShiftPlanByAuthorId,
  getSingleShiftPlanById,
};

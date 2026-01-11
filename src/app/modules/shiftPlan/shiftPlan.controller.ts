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

export const ShiftPlanController = {
  createShiftPlan,
};

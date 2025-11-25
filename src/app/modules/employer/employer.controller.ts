import { Request, Response, NextFunction } from 'express';
import { EmployerServices } from './employer.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// update my employer profile
export const updateMyEmployerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployerServices.updateEmployerByUserId(
      req.user.id,
      req.body
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Employer profile updated successfully',
      data: result,
    });
  }
);

export const EmployerController = {
  updateMyEmployerProfile,
};
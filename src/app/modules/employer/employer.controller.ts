import { Request, Response, NextFunction } from 'express';
import { EmployerServices } from './employer.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

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

// update both employer and user profile
export const updateEmployerUserProfile = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    // handle image upload
    const image = getSingleFilePath(req.files, 'image');
    if (image) {
      payload.image = image;
    }
    // handle location update
    if(payload.location) {
      const [longitude, latitude] = payload.location;
      payload.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }
    
    const result = await EmployerServices.updateEmployerUserProfile(
      req.user.id,
      payload
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Employer profile updated successfully',
      data: result,
    });
  }
);

// get my employer profile
export const getMyEmployerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployerServices.getEmployerByUserId(req.user.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Employer profile retrieved successfully',
      data: result,
    });
  }
);

// get employer by user id
const getEmployerByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployerServices.getEmployerByUserId(req.params.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Employer profile retrieved successfully',
      data: result,
    });
  }
);

export const EmployerController = {
  updateMyEmployerProfile,
  updateEmployerUserProfile,
  getMyEmployerProfile,
  getEmployerByUserId,
};
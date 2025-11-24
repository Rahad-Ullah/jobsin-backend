import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

// create user
const createUser = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  const result = await UserService.createUserIntoDB(userData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User created successfully',
    data: result,
  });
});

// create admin
const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  const result = await UserService.createAdminToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin created successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  let image = getSingleFilePath(req.files, 'image');

  const payload = {
    image,
    ...req.body,
  };

  // update location in the payload
  if (req.body.location) {
    const [longitude, latitude] = req.body.location;
    payload.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }

  const result = await UserService.updateUserByIdIntoDB(req.user.id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

//get profile
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserProfileFromDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//get single user by id
const getSingleUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserByIdFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  createAdmin,
  updateProfile,
  getUserProfile,
  getSingleUserById,
};

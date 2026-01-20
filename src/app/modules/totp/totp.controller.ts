import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import TOTPService from './totp.service';

// create user
const createToken = catchAsync(async (req: Request, res: Response) => {
      const { ...userData } = req.body;
      const result = await TOTPService.generateQRCode(userData.id);

      sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'User created successfully',
            data: result,
      });
});

// create admin
const verifyToken = catchAsync(async (req: Request, res: Response) => {
      const { secret, otp } = req.body;
      const result = await TOTPService.verifyToken(secret, otp);

      sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Admin created successfully',
            data: result,
      });
});





export const UserController = {
      createToken,
      verifyToken,
};

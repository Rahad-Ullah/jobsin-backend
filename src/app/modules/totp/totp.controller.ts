import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TOTPService } from './totp.service';

// create 2fa token
const createToken = catchAsync(async (req: Request, res: Response) => {
  const result = await TOTPService.generateQRCode(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: '2FA token created successfully',
    data: result,
  });
});

// verify 2fa token
const verifyToken = catchAsync(async (req: Request, res: Response) => {
  const { userId, otp } = req.body;
  const result = await TOTPService.verifyToken(userId, otp);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: '2FA token verified successfully',
    data: result,
  });
});

export const UserController = {
  createToken,
  verifyToken,
};

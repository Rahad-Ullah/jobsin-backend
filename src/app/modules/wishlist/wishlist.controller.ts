import { Request, Response, NextFunction } from 'express';
import { WishlistServices } from './wishlist.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create wishlist
const createWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistServices.createWishlist({
    ...req.body,
    user: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Wishlist created successfully',
    data: result,
  });
});

export const WishlistController = {
  createWishlist,
};
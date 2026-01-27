import { Request, Response, NextFunction } from 'express';
import { SubscriptionServices } from './subscription.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create subscription
const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.createSubscription({
    ...req.body,
    user: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscription created successfully',
    data: result,
  });
});

// gift subscription
const giftSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.giftSubscription({
    ...req.body,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscription gifted successfully',
    data: result,
  });
});

// cancel subscription
const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.cancelSubscription(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscription canceled successfully',
    data: result,
  });
});

// get my subscriptions
const getMySubscriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.getMySubscriptions(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriptions retrieved successfully',
    data: result,
  });
});

// get all subscribers
const getAllSubscribers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await SubscriptionServices.getAllSubscribers(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Subscribers retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },
);

export const SubscriptionController = {
  createSubscription,
  giftSubscription,
  cancelSubscription,
  getMySubscriptions,
  getAllSubscribers,
};

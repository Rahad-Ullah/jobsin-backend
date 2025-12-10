import { Request, Response, NextFunction } from 'express';
import { FeedbackServices } from './feedback.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create feedback
const createFeedback = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackServices.createFeedbackToDB({
    ...req.body,
    reviewer: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Feedback created successfully',
    data: result,
  });
});

// update feedback
const updateFeedback = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackServices.updateFeedback(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Feedback updated successfully',
    data: result,
  });
});

// get feedback given to me
const getFeedbackGivenToMe = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackServices.getFeedbackByUserId(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Feedback retrieved successfully',
    data: result,
  });
});

export const FeedbackController = {
  createFeedback,
  updateFeedback,
  getFeedbackGivenToMe,
};
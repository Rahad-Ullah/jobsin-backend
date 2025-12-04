import { Request, Response, NextFunction } from 'express';
import { NotificationServices } from './notification.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// get my notifications
export const getMyNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NotificationServices.getNotificationsByUserId(
      req.user.id,
      req.query
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notifications retrieved successfully',
      data: { data: result?.notifications, unreadCount: result?.unreadCount },
      pagination: result?.pagination,
    });
  }
);

export const NotificationController = {
  getMyNotifications,
};

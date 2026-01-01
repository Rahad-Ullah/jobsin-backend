import { Request, Response, NextFunction } from 'express';
import { ChatServices } from './chat.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create chat
const createChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChatServices.createChatIntoDB(req.user, req.body);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Chat created successfully',
      data: result,
    });
  }
);

// delete chat
const deleteChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChatServices.deleteChatFromDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Chat created successfully',
      data: result,
    });
  }
);

// // getMy chat
// const getMyChats = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const result = await ChatServices.getMyChatsFromDB(req.user, req.query);

//     sendResponse(res, {
//       success: true,
//       statusCode: 200,
//       message: 'Chats retrieved successfully',
//       data: result,
//     });
//   }
// );

// // get online chats
// const getOnlineChats = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const result = await ChatServices.getOnlineChatsFromDB(req.user, req.query);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: 'Online chats retrieved successfully',
//       data: result,
//     });
//   }
// );

export const ChatController = {
  createChat,
  deleteChat,
  // getMyChats,
  // getOnlineChats,
};

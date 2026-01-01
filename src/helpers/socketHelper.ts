import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import { socketAuth } from '../app/middlewares/socketAuth';
import { Chat } from '../app/modules/chat/chat.model';

const socket = (io: Server) => {
  // authenticate by jwt auth middleware
  io.use(socketAuth);

  io.on('connection', socket => {
    const userId = socket.data.userId;

    logger.info(colors.blue(`User connected: ${userId}`));

    // join personal room
    socket.join(`user:${userId}`);

    // join chat room
    socket.on('joinChat', async (chatId: string) => {
      if (!chatId || !chatId.match(/^[0-9a-fA-F]{24}$/)) {
        return socket.emit('error', 'Invalid chatId');
      }
      const chat = await Chat.findOne({
        _id: chatId,
        isDeleted: false,
        participants: { $in: [userId] },
      });

      if (!chat) {
        return socket.emit('error', 'Chat not found');
      }

      socket.join(`chat:${chatId}`);
      logger.info(colors.blue(`User:${userId} joined chat:${chatId}`));
    });

    // leave chat
    socket.on('leaveChat', (chatId: string) => {
      if (!chatId || !chatId.match(/^[0-9a-fA-F]{24}$/)) {
        return socket.emit('error', 'Invalid chatId');
      }
      socket.leave(`chat:${chatId}`);
    });

    socket.on('disconnect', () => {
      logger.info(colors.red(`User disconnected: ${userId}`));
    });
  });
};

export const socketHelper = { socket };

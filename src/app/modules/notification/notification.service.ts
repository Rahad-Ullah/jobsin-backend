import { timeAgo } from '../../../shared/timeAgo';
import QueryBuilder from '../../builder/QueryBuilder';
import { Notification } from './notification.model';

// get notifications by user id
const getNotificationsByUserId = async (
  userId: string,
  query: Record<string, any>
): Promise<{ notifications: any; pagination: any; unreadCount: number }> => {
  const notificationQuery = new QueryBuilder(
    Notification.find({ receiver: userId }).sort('-createdAt'),
    query
  ).paginate();

  const [notifications, pagination, unreadCount] = await Promise.all([
    notificationQuery.modelQuery.lean().exec(),
    notificationQuery.getPaginationInfo(),
    Notification.countDocuments({ receiver: userId, isRead: false }),
  ]);

  return {
    notifications: notifications.map((notification: any) => {
      return {
        ...notification,
        timeAgo: timeAgo(notification.createdAt),
      };
    }),
    pagination,
    unreadCount,
  };
};

export const NotificationServices = {
  getNotificationsByUserId,
};

import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// get my notifications
router.get('/me', auth(), NotificationController.getMyNotifications);

export const notificationRoutes = router;

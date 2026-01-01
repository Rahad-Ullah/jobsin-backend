import express from 'express';
import { AnalyticsController } from './analytics.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

// get overview
router.get(
  '/overview',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getOverview
);

// get analytics
router.get(
  '/user-growth',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getYearlyUserGrowth
);

// get analytics
router.get(
  '/subscribers-growth',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getMonthlySubscribersGrowth
);

export const analyticsRoutes = router;

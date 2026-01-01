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

// get user growth
router.get(
  '/user-growth',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getYearlyUserGrowth
);

// get subscribers growth
router.get(
  '/subscribers-growth',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getMonthlySubscribersGrowth
);

// get revenue growth
router.get(
  '/revenue-growth',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getMonthlyRevenueGrowth
);

export const analyticsRoutes = router;

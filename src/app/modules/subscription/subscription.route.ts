import express from 'express';
import { SubscriptionController } from './subscription.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { SubscriptionValidations } from './subscription.validation';

const router = express.Router();

// create subscription
router.post(
  '/create',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(SubscriptionValidations.createSubscriptionSchema),
  SubscriptionController.createSubscription
);

// gift subscription
router.post(
  '/gift',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(SubscriptionValidations.giftSubscriptionSchema),
  SubscriptionController.giftSubscription
);

// get my subscriptions
router.get(
  '/me',
  auth(USER_ROLES.EMPLOYER),
  SubscriptionController.getMySubscriptions
);

// get all subscribers
router.get(
  '/subscribers',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SubscriptionController.getAllSubscribers
);

export const subscriptionRoutes = router;
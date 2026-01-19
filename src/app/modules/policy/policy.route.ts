import express from 'express';
import { PolicyController } from './policy.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { PolicyValidations } from './policy.validation';

const router = express.Router();

// create/update policy
router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(PolicyValidations.policySchema),
  PolicyController.createUpdatePolicy,
);

// get policy
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PolicyController.getPolicy,
);

export const policyRoutes = router;

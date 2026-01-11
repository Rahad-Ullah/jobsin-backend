import express from 'express';
import { ShiftPlanController } from './shiftPlan.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { ShiftPlanValidations } from './shiftPlan.validation';

const router = express.Router();

// create shift plan
router.post(
  '/create',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(ShiftPlanValidations.createShiftPlanValidation),
  ShiftPlanController.createShiftPlan
);

export const shiftPlanRoutes = router;
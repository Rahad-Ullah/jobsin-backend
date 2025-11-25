import express from 'express';
import { EmployerController } from './employer.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { EmployerValidations } from './employer.validation';

const router = express.Router();

// update my employer profile
router.patch(
  '/me',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(EmployerValidations.updateEmployerSchema),
  EmployerController.updateMyEmployerProfile
);

export const employerRoutes = router;
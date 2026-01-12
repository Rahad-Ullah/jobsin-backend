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

// update my employer profile
router.patch(
  '/profile',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(EmployerValidations.updateEmployerSchema),
  EmployerController.updateMyEmployerProfile
);

// get my employer profile
router.get(
  '/me',
  auth(USER_ROLES.EMPLOYER),
  EmployerController.getMyEmployerProfile
);

// get employer by user id
router.get(
  '/single/:id',
  auth(),
  EmployerController.getEmployerByUserId
);

export const employerRoutes = router;
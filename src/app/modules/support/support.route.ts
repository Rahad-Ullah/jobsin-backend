import express from 'express';
import { SupportController } from './support.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SupportValidations } from './support.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

// create support
router.post(
  '/create',
  fileUploadHandler(),
  validateRequest(SupportValidations.createSupportValidation),
  SupportController.createSupport
);

// create for logged in user
router.post(
  '/create/logged-in-user',
  auth(USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER),
  fileUploadHandler(),
  validateRequest(SupportValidations.createSupportForLoggedInUserValidation),
  SupportController.createSupportForLoggedInUser
);

// update support
router.patch(
  '/update/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(SupportValidations.updateSupportValidation),
  SupportController.updateSupport
);

// get single
router.get(
  '/single/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SupportController.getSingleSupportById
);

// get all support
router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SupportController.getAllSupports
);

export const supportRoutes = router;
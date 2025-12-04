import express from 'express';
import { VerificationController } from './verification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { VerificationValidations } from './verification.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// create verification
router.post(
  '/create',
  auth(USER_ROLES.EMPLOYER),
  fileUploadHandler(),
  validateRequest(VerificationValidations.createVerificationValidation),
  VerificationController.createVerification
);

// update verification
router.patch(
  '/update/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(VerificationValidations.updateVerificationValidation),
  VerificationController.updateVerification
);

// get my verifications
router.get(
  '/me',
  auth(USER_ROLES.EMPLOYER),
  VerificationController.getMyVerifications
);

// get all verifications
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  VerificationController.getAllVerifications
);

export const verificationRoutes = router;

import express from 'express';
import { ApplicationController } from './application.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { ApplicationValidations } from './application.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// create application
router.post(
  '/create',
  auth(USER_ROLES.JOB_SEEKER),
  fileUploadHandler(),
  validateRequest(ApplicationValidations.createApplicationValidation),
  ApplicationController.createApplication
);

export const applicationRoutes = router;
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

// update application
router.patch(
  '/update/:id',
  auth(USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER),
  validateRequest(ApplicationValidations.updateApplicationValidation),
  ApplicationController.updateApplication
);

// get applications by job id
router.get(
  '/job/:id',
  auth(USER_ROLES.EMPLOYER),
  ApplicationController.getApplicationsByJobId
);

// get my applications
router.get(
  '/me',
  auth(USER_ROLES.JOB_SEEKER),
  ApplicationController.getMyApplications
);

// get single application by id
router.get(
  '/single/:id',
  auth(),
  ApplicationController.getSingleApplicationById
);

export const applicationRoutes = router;
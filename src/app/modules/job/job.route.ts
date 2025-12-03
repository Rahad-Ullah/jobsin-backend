import express from 'express';
import { JobController } from './job.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { JobValidations } from './job.validation';

const router = express.Router();

// create job post
router.post(
  '/create',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(JobValidations.createJobValidation),
  JobController.createJob
);

// update job post
router.patch(
  '/update/:id',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(JobValidations.updateJobValidation),
  JobController.updateJob
);

export const jobRoutes = router;
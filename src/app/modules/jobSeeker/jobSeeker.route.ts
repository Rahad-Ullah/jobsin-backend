import express from 'express';
import { JobSeekerController } from './jobSeeker.controller';
import { USER_ROLES } from '../user/user.constant';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { JobSeekerValidations } from './jobSeeker.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.patch(
  '/update-me',
  auth(USER_ROLES.JOB_SEEKER),
  fileUploadHandler(),
  validateRequest(JobSeekerValidations.jobSeekerSchema),
  JobSeekerController.updateJobSeeker
);

export const jobSeekerRoutes = router;
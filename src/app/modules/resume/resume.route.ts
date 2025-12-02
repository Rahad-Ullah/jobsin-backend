import express from 'express';
import { ResumeController } from './resume.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { ResumeValidations } from './resume.validation';

const router = express.Router();

// create/update resume
router.patch(
  '/update',
  auth(USER_ROLES.JOB_SEEKER),
  validateRequest(ResumeValidations.resumeSchema),
  ResumeController.createUpdateResume
);

export const resumeRoutes = router;
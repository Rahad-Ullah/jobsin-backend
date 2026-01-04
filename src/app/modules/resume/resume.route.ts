import express from 'express';
import { ResumeController } from './resume.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { ResumeValidations } from './resume.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// create/update resume
router.patch(
  '/update',
  auth(USER_ROLES.JOB_SEEKER),
  fileUploadHandler(),
  validateRequest(ResumeValidations.resumeSchema),
  ResumeController.createUpdateResume
);

// get single resume by user id
router.get('/single/:id', auth(), ResumeController.getResumeByUserId);

// get my resume
router.get('/me', auth(USER_ROLES.JOB_SEEKER), ResumeController.getMyResume);

export const resumeRoutes = router;
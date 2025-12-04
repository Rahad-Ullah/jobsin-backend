import express from 'express';
import { FeedbackController } from './feedback.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { FeedbackValidations } from './feedback.validation';

const router = express.Router();

// create feedback
router.post(
  '/create',
  auth(USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER),
  validateRequest(FeedbackValidations.createFeedbackValidation),
  FeedbackController.createFeedback
);

// update feedback
router.patch(
  '/update/:id',
  auth(USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER),
  validateRequest(FeedbackValidations.updateFeedbackValidation),
  FeedbackController.updateFeedback
);

export const feedbackRoutes = router;
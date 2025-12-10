import express from 'express';
import { SupportController } from './support.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SupportValidations } from './support.validation';

const router = express.Router();

// create support
router.post(
  '/create',
  validateRequest(SupportValidations.createSupportValidation),
  SupportController.createSupport
);

export const supportRoutes = router;
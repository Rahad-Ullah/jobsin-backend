import express from 'express';
import { SupportController } from './support.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SupportValidations } from './support.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// create support
router.post(
  '/create',
  fileUploadHandler(),
  validateRequest(SupportValidations.createSupportValidation),
  SupportController.createSupport
);

// update support
router.patch(
  '/update/:id',
  validateRequest(SupportValidations.updateSupportValidation),
  SupportController.updateSupport
);

export const supportRoutes = router;
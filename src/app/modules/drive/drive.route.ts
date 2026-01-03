import express from 'express';
import { DriveController } from './drive.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DriveValidations } from './drive.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// create drive
router.post(
  '/upload',
  auth(),
  fileUploadHandler(),
  validateRequest(DriveValidations.createDriveValidation),
  DriveController.createDrive
);

export const driveRoutes = router;

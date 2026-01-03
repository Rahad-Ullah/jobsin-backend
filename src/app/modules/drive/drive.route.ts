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

// update drive
router.patch(
  '/rename/:id',
  auth(),
  validateRequest(DriveValidations.updateDriveValidation),
  DriveController.updateDrive
);

// delete drive
router.delete('/:id', auth(), DriveController.deleteDrive);

// get my drives
router.get('/my-drives', auth(), DriveController.getMyDrives);

export const driveRoutes = router;

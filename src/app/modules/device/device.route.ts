import express from 'express';
import { DeviceController } from './device.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DeviceValidations } from './device.validation';

const router = express.Router();

// create device
router.post(
  '/create',
  auth(),
  validateRequest(DeviceValidations.createDeviceValidation),
  DeviceController.createDevice
);

// remove device
router.delete('/:id', auth(), DeviceController.removeDevice);

// get devices
router.get('/me', auth(), DeviceController.getDevices);

export const deviceRoutes = router;
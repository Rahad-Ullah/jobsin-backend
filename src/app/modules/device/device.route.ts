import express from 'express';
import { DeviceController } from './device.controller';

const router = express.Router();

router.get('/', DeviceController);

export const deviceRoutes = router;
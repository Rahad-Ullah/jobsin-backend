import express from 'express';
import { WorkerController } from './worker.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

// create worker
router.post(
  '/create',
  auth(USER_ROLES.EMPLOYER),
  WorkerController.createWorker
);

export const workerRoutes = router;
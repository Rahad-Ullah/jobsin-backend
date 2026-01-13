import express from 'express';
import { WorkerController } from './worker.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { WorkerValidations } from './worker.validation';

const router = express.Router();

// create worker
router.post(
  '/create',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(WorkerValidations.createWorkerValidation),
  WorkerController.createWorker
);

// update worker
router.patch(
  '/update/:id',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(WorkerValidations.updateWorkerValidation),
  WorkerController.updateWorker
);

// delete worker
router.delete('/:id', auth(USER_ROLES.EMPLOYER), WorkerController.deleteWorker);

// get my workers
router.get('/me', auth(USER_ROLES.EMPLOYER), WorkerController.getMyWorkers);

export const workerRoutes = router;
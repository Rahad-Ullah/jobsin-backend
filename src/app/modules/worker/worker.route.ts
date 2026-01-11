import express from 'express';
import { WorkerController } from './worker.controller';

const router = express.Router();

router.get('/', WorkerController);

export const workerRoutes = router;
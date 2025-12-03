import express from 'express';
import { JobController } from './job.controller';

const router = express.Router();

router.get('/', JobController);

export const jobRoutes = router;
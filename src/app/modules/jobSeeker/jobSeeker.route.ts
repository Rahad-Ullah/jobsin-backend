import express from 'express';
import { JobSeekerController } from './jobSeeker.controller';

const router = express.Router();

router.get('/', JobSeekerController);

export const jobSeekerRoutes = router;
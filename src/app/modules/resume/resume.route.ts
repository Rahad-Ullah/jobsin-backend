import express from 'express';
import { ResumeController } from './resume.controller';

const router = express.Router();

router.get('/', ResumeController);

export const resumeRoutes = router;
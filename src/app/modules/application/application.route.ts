import express from 'express';
import { ApplicationController } from './application.controller';

const router = express.Router();

router.get('/', ApplicationController);

export const applicationRoutes = router;
import express from 'express';
import { FeedbackController } from './feedback.controller';

const router = express.Router();

router.get('/', FeedbackController);

export const feedbackRoutes = router;
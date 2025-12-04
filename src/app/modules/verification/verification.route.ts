import express from 'express';
import { VerificationController } from './verification.controller';

const router = express.Router();

router.get('/', VerificationController);

export const verificationRoutes = router;
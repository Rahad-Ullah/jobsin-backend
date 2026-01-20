import express from 'express';
import { UserController } from './totp.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TotpValidations } from './totp.validation';

const router = express.Router();

// create user
router.post('/generate-token', auth(), UserController.createToken);

router.post(
  '/verify-token',
  validateRequest(TotpValidations.verifyTokenZodSchema),
  UserController.verifyToken,
);

export default router;

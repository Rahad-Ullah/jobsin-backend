
import express from 'express';
import { UserController } from './totp.controller';

const router = express.Router();

// create user
router.post(
      '/generate-token',
      UserController.createToken
);

router.post(
      '/verify-token',
      UserController.verifyToken
);


export default router;

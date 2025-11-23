import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { USER_ROLES } from './user.constant';
const router = express.Router();

// create user
router.post(
  '/create-user',
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUser
);

// create admin
router.post(
  '/create-admin',
  auth(USER_ROLES.SUPER_ADMIN),
  validateRequest(UserValidation.createAdminZodSchema),
  UserController.createAdmin
);

// update profile
router.patch(
  '/profile',
  auth(),
  fileUploadHandler(),
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateProfile
);

// get profile
router.get('/profile', auth(), UserController.getUserProfile);

export const UserRoutes = router;

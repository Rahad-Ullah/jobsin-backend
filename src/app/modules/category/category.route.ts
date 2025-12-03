import express from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidations } from './category.validation';

const router = express.Router();

// create category
router.post(
  '/create',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(CategoryValidations.createCategorySchema),
  CategoryController.createCategory
);

// update category
router.patch(
  '/update/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(CategoryValidations.updateCategorySchema),
  CategoryController.updateCategory
);

export const categoryRoutes = router;
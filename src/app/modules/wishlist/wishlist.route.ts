import express from 'express';
import { WishlistController } from './wishlist.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { WishlistValidations } from './wishlist.validation';

const router = express.Router();

// create wishlist
router.post(
  '/create',
  auth(USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER),
  validateRequest(WishlistValidations.createWishlistValidation),
  WishlistController.createWishlist
);

export const wishlistRoutes = router;
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
  auth(USER_ROLES.JOB_SEEKER),
  validateRequest(WishlistValidations.createWishlistValidation),
  WishlistController.createWishlist
);

// delete wishlist
router.delete(
  '/delete/:id',
  auth(USER_ROLES.JOB_SEEKER),
  WishlistController.deleteWishlist
);

// get my wishlist
router.get(
  '/me',
  auth(USER_ROLES.JOB_SEEKER),
  WishlistController.getMyWishlist
);

export const wishlistRoutes = router;
import express from 'express';
import { PackageController } from './package.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { PackageValidations } from './package.validation';

const router = express.Router();

// create package
router.post(
  '/create',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(PackageValidations.createPackageValidation),
  PackageController.createPackage
);

// update package
router.patch(
  '/update/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(PackageValidations.updatePackageValidation),
  PackageController.updatePackage
);

// delete package
router.delete(
  '/delete/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PackageController.deletePackage
);

// get all packages
router.get('/', PackageController.getAllPackages);

export const packageRoutes = router;
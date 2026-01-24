import express from 'express';
import { SalaryController } from './salary.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SalaryValidations } from './salary.validation';

const router = express.Router();

// Salary comparison route
router.post(
  '/compare',
  auth(),
  validateRequest(SalaryValidations.SalaryComparisonInputSchema),
  SalaryController.salaryComparison,
);

export const salaryRoutes = router;

import express from 'express';
import { InvoiceController } from './invoice.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

// get my invoices
router.get(
  '/me',
  auth(USER_ROLES.EMPLOYER, USER_ROLES.JOB_SEEKER),
  InvoiceController.getMyInvoices
);

// get all invoices
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  InvoiceController.getAllInvoices
);

export const invoiceRoutes = router;

import express from 'express';
import { InvoiceController } from './invoice.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { invoiceValidation } from './invoice.validation';

const router = express.Router();

// refund invoice
router.post(
  '/refund',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(invoiceValidation.createRefundInvoiceValidation),
  InvoiceController.refundInvoice,
);

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

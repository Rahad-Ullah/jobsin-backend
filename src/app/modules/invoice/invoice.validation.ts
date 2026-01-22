import z from 'zod';
import { RefundReason } from './invoice.constants';

// create refund invoice validation
const createRefundInvoiceValidation = z.object({
  body: z.object({
    invoiceId: z
      .string()
      .nonempty('Invoice id is required')
      .length(24, 'Invalid invoice id'),
    reason: z.nativeEnum(RefundReason),
  }),
});

export const invoiceValidation = {
  createRefundInvoiceValidation,
};

import z from 'zod';

// create refund invoice validation
const createRefundInvoiceValidation = z.object({
  body: z.object({
    invoiceId: z
      .string()
      .nonempty('Invoice id is required')
      .length(24, 'Invalid invoice id'),
    reason: z.string().nonempty('Reason is required'),
  }),
});

export const invoiceValidation = {
  createRefundInvoiceValidation,
};

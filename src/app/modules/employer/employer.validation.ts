import { z } from 'zod';

// update employer validation schema
export const updateEmployerSchema = z.object({
  body: z.object({
    businessCategory: z
      .string()
      .nonempty('Business Category cannot be empty')
      .optional(),
    legalForm: z.string().nonempty('Legal Form cannot be empty').optional(),
    taxNo: z.string().nonempty('Tax No cannot be empty').optional(),
    deNo: z.string().nonempty('DE No cannot be empty').optional(),
    about: z.string().nonempty('About cannot be empty').optional(),
  }).strict(),
});

export const EmployerValidations = {
  updateEmployerSchema,
};

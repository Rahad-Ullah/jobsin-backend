import { z } from 'zod';

// update employer validation schema
const updateEmployerSchema = z.object({
  body: z
    .object({
      businessCategory: z
        .string()
        .nonempty('Business Category cannot be empty')
        .optional(),
      legalForm: z.string().nonempty('Legal Form cannot be empty').optional(),
      taxNo: z.string().nonempty('Tax No cannot be empty').optional(),
      deNo: z.string().nonempty('DE No cannot be empty').optional(),
      whatsApp: z.string().nonempty('WhatsApp cannot be empty').optional(),
      about: z.string().nonempty('About cannot be empty').optional(),
    })
    .strict(),
});

// update employer profile validation schema
const updateEmployerProfileSchema = z.object({
  body: z
    .object({
      name: z.string().nonempty('Name cannot be empty').optional(),
      address: z.string().nonempty('Address cannot be empty').optional(),
      phone: z.string().nonempty('Phone cannot be empty').optional(),
      businessCategory: z
        .string()
        .nonempty('Business Category cannot be empty')
        .optional(),
      legalForm: z.string().nonempty('Legal Form cannot be empty').optional(),
      taxNo: z.string().nonempty('Tax No cannot be empty').optional(),
      deNo: z.string().nonempty('DE No cannot be empty').optional(),
      whatsApp: z.string().nonempty('WhatsApp cannot be empty').optional(),
      about: z.string().nonempty('About cannot be empty').optional(),
      image: z.string().optional(),
    })
    .strict(),
});

export const EmployerValidations = {
  updateEmployerSchema,
  updateEmployerProfileSchema,
};

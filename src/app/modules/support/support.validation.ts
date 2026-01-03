import { z } from 'zod';
import { SupportStatus } from './support.constants';

// Support creation schema
export const createSupportValidation = z.object({
  body: z
    .object({
      name: z.string().nonempty('Name is required'),
      email: z.string().email('Invalid email format'),
      phone: z
        .string()
        .min(10, 'Phone must be at least 10 characters')
        .max(15, 'Phone must be at most 15 characters'),
      address: z.string().default(''),
      message: z.string().nonempty('Message is required'),
      attachment: z.string().default(''),
    })
    .strict(),
});

// Support update schema (PATCH)
export const updateSupportValidation = z.object({
  body: z
    .object({
      status: z.nativeEnum(SupportStatus).optional(),
      reply: z.string().nonempty('Reply cannot be empty').optional(),
    })
    .strict(),
});

export const SupportValidations = {
  createSupportValidation,
  updateSupportValidation,
};

import { z } from 'zod';
import { ApplicationStatus } from './application.constants';

const objectIdSchema = z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ObjectId format',
});

// Application creation schema
export const createApplicationValidation = z.object({
  body: z
    .object({
      job: objectIdSchema,
      doc: z.string().optional(),
      isResume: z.boolean().default(false),
      expectedSalary: z
        .number({ required_error: 'Expected salary is required' })
        .positive('Expected salary must be positive'),
    })
    .strict(),
});

// Application update schema
export const updateApplicationValidation = z.object({
  body: z
    .object({
      status: z.nativeEnum(ApplicationStatus).optional(),
    })
    .strict(),
});

export const ApplicationValidations = {
  createApplicationValidation,
  updateApplicationValidation,
};

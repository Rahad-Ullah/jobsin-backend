import { z } from 'zod';

// create worker validation
const createWorkerValidation = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Name is required' })
        .nonempty("Name can't be empty!"),
      email: z
        .string({ required_error: 'Email is required' })
        .email('Not a valid email!')
        .nonempty("Email can't be empty!"),
      phone: z
        .string({ required_error: 'Phone is required' })
        .min(10, 'Phone must be at least 10 characters')
        .max(15, 'Phone must be at most 15 characters'),
      address: z
        .string({ required_error: 'Address is required' })
        .nonempty("Address can't be empty!"),
    })
    .strict(),
});

export const WorkerValidations = {
  createWorkerValidation,
};

import { z } from 'zod';
import { USER_ROLES, USER_STATUS } from './user.constant';

const createUserZodSchema = z.object({
  body: z
    .object({
      name: z.string({ required_error: 'Name is required' }),
      email: z.string({ required_error: 'Email is required' }),
      password: z.string({ required_error: 'Password is required' }),
      role: z.enum([USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER], {
        required_error: 'Invalid role',
      }),
    })
    .strict(),
});

const createAdminZodSchema = z.object({
  body: z
    .object({
      name: z.string({ required_error: 'Name is required' }),
      email: z.string({ required_error: 'Email is required' }),
      password: z.string({ required_error: 'Password is required' }),
    })
    .strict(),
});

const updateUserZodSchema = z.object({
  name: z.string().nonempty('Name cannot be empty').optional(),
  phone: z.string().nonempty('Phone cannot be empty').optional(),
  address: z.string().nonempty('Address cannot be empty').optional(),
  location: z
    .array(z.number())
    .length(2, 'Location must be an array of 2 numbers [longitude, latitude]')
    .optional(),
  image: z.string().optional(),
});

export const UserValidation = {
  createUserZodSchema,
  createAdminZodSchema,
  updateUserZodSchema,
};

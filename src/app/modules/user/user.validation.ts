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
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  status: z.nativeEnum(USER_STATUS).optional(),
});

export const UserValidation = {
  createUserZodSchema,
  createAdminZodSchema,
  updateUserZodSchema,
};

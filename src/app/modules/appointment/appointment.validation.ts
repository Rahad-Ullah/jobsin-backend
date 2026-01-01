import { z } from 'zod';
import { AppointmentStatus } from './appointment.constants';

// Helper for MongoDB ObjectId validation
const objectIdSchema = z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ObjectId format',
});

export const createAppointmentZodSchema = z.object({
  body: z
    .object({
      receiver: objectIdSchema,
      job: objectIdSchema.optional(),
      scheduledAt: z
        .string({
          required_error: 'Scheduled date and time is required',
        })
        .datetime(),
      address: z
        .string({
          required_error: 'Address is required',
        })
        .optional(),
      message: z.string({
        required_error: 'Message is required',
      }),
    })
    .strict(),
});

export const updateAppointmentZodSchema = z.object({
  body: z
    .object({
      status: z.nativeEnum(AppointmentStatus, {
        required_error: 'Valid status is required',
      }),
    })
    .strict(),
});

export const AppointmentValidations = {
  createAppointmentZodSchema,
  updateAppointmentZodSchema,
};

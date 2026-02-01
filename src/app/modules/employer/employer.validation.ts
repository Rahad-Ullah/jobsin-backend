import { z } from 'zod';
import { RepeatType } from './employer.constant';

// Notification Settings schema
const notificationSettingsSchema = z
  .object({
    pushNotification: z.boolean().optional(),
    emailNotification: z.boolean().optional(),
    repeat: z.nativeEnum(RepeatType).optional(),
    email: z.string().email('Email must be valid').optional(),
  })
  .strict();

// update employer validation schema
const updateEmployerSchema = z.object({
  body: z
    .object({
      businessCategory: z.string().optional(),
      legalForm: z.string().optional(),
      taxNo: z.string().optional(),
      deNo: z.string().optional(),
      whatsApp: z.string().optional(),
      about: z.string().optional(),
      notificationSettings: notificationSettingsSchema.optional(),
    })
    .strict(),
});

// update employer profile validation schema
const updateEmployerProfileSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      address: z.string().optional(),
      location: z
        .array(z.number())
        .length(2, {
          message: 'Location must be in the format [longitude, latitude]',
        })
        .optional(),
      phone: z.string().optional(),
      businessCategory: z.string().optional(),
      legalForm: z.string().optional(),
      taxNo: z.string().optional(),
      deNo: z.string().optional(),
      whatsApp: z.string().optional(),
      about: z.string().optional(),
      image: z.string().optional(),
      notificationSettings: notificationSettingsSchema.optional(),
    })
    .strict(),
});

export const EmployerValidations = {
  updateEmployerSchema,
  updateEmployerProfileSchema,
};

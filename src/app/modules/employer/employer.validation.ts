import { z } from 'zod';
import { RepeatType } from './employer.constant';

// Notification Settings schema
const notificationSettingsSchema = z
  .object({
    pushNotification: z.boolean().default(false),
    emailNotification: z.boolean().default(false),
    repeat: z.nativeEnum(RepeatType).default(RepeatType.WEEKLY),
    email: z.string().email('Email must be valid').default(''),
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

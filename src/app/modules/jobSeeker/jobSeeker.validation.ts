import { z } from 'zod';
import { RepeatType, SalaryType } from './jobSeeker.constants';

// Notification Settings schema
const notificationSettingsSchema = z
  .object({
    pushNotification: z.boolean().optional(),
    emailNotification: z.boolean().optional(),
    repeat: z.nativeEnum(RepeatType).optional(),
    email: z.string().email('Email must be valid').optional(),
  })
  .strict();

// Work Experience schema
export const experienceSchema = z
  .object({
    category: z.string().nonempty('Category cannot be empty'),
    subCategory: z.string().nonempty('Sub-category cannot be empty'),
    experience: z.number().min(0).nonnegative('Experience cannot be negative'),
    salaryType: z.nativeEnum(SalaryType),
    salaryAmount: z.number().min(0).positive('Salary amount must be positive'),
  })
  .strict();

// Job Seeker schema
export const jobSeekerSchema = z.object({
  body: z
    .object({
      overview: z.string().max(500).optional(),
      about: z.string().max(2000).optional(),
      experiences: z.array(experienceSchema).optional(),
      doc: z.string().optional(),
      image: z.string().optional(),
      removedImages: z.array(z.string()).optional(),
      isProfileVisible: z.boolean().default(true).optional(),
      notificationSettings: notificationSettingsSchema.optional(),
    })
    .strict(),
});

export const JobSeekerValidations = {
  jobSeekerSchema,
};

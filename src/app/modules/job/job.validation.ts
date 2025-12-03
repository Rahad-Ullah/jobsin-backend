import { z } from 'zod';
import {
  ExperienceLevel,
  JobStatus,
  JobType,
  RepeatType,
  SalaryType,
} from './job.constants';

// Notification Settings schema
const notificationSettingsSchema = z
  .object({
    pushNotification: z.boolean().default(false),
    emailNotification: z.boolean().default(false),
    repeat: z.nativeEnum(RepeatType),
    email: z.string().email('Email must be valid').default(''),
  })
  .strict();

// Job schema for creation
export const createJobValidation = z
  .object({
    category: z.string().nonempty('Category is required'),
    subCategory: z.string().nonempty('SubCategory is required'),
    jobType: z.nativeEnum(JobType),
    experience: z.nativeEnum(ExperienceLevel),
    deadline: z.preprocess(
      val => (typeof val === 'string' ? new Date(val) : val),
      z.date().refine(d => d > new Date(), {
        message: 'Deadline must be in the future',
      })
    ),
    salaryType: z.nativeEnum(SalaryType),
    description: z.string().nonempty('Description is required'),
    responsibilities: z
      .array(z.string())
      .min(1, 'At least one responsibility is required'),
    qualifications: z
      .array(z.string())
      .min(1, 'At least one qualification is required'),
    aboutCompany: z.string().nonempty('About company is required'),
    status: z.nativeEnum(JobStatus).default(JobStatus.OPEN),
    isDeleted: z.boolean().default(false),
    notificationSettings: notificationSettingsSchema,
  })
  .strict();

// job schema for update
export const updateJobValidation = z
  .object({
    category: z.string().optional(),
    subCategory: z.string().optional(),
    jobType: z.nativeEnum(JobType).optional(),
    experience: z.nativeEnum(ExperienceLevel).optional(),
    deadline: z.date().optional(),
    salaryType: z.nativeEnum(SalaryType).optional(),
    description: z.string().optional(),
    responsibilities: z.array(z.string()).optional(),
    qualifications: z.array(z.string()).optional(),
    aboutCompany: z.string().optional(),
    isDeleted: z.boolean().optional(),
    notificationSettings: notificationSettingsSchema.optional(),
  })
  .strict();

export const JobValidations = {
  createJobValidation,
  updateJobValidation,
};

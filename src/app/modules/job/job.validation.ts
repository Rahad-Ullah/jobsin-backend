import { z } from 'zod';
import {
  ExperienceLevel,
  JobStatus,
  JobType,
  SalaryType,
} from './job.constants';

// Job schema for creation
export const createJobValidation = z.object({
  body: z
    .object({
      category: z.string().nonempty('Category is required'),
      subCategory: z.string().nonempty('SubCategory is required'),
      jobType: z.nativeEnum(JobType),
      experience: z.nativeEnum(ExperienceLevel),
      deadline: z.preprocess(
        val => (typeof val === 'string' ? new Date(val) : val),
        z.date().refine(d => d > new Date(), {
          message: 'Deadline must be in the future',
        }),
      ),
      salaryType: z.nativeEnum(SalaryType),
      salaryAmount: z
        .number()
        .min(0)
        .positive('Salary amount must be positive'),
      description: z.string().nonempty('Description is required'),
      responsibilities: z
        .array(z.string())
        .min(1, 'At least one responsibility is required'),
      qualifications: z
        .array(z.string())
        .min(1, 'At least one qualification is required'),
      aboutCompany: z.string().nonempty('About company is required'),
      isHiringRequest: z.boolean().default(false).optional(),
    })
    .strict(),
});

// job schema for update
export const updateJobValidation = z.object({
  body: z
    .object({
      category: z.string().optional(),
      subCategory: z.string().optional(),
      jobType: z.nativeEnum(JobType).optional(),
      experience: z.nativeEnum(ExperienceLevel).optional(),
      deadline: z.string().datetime().optional(),
      salaryType: z.nativeEnum(SalaryType).optional(),
      salaryAmount: z
        .number()
        .min(0)
        .positive('Salary amount must be positive')
        .optional(),
      description: z.string().optional(),
      responsibilities: z.array(z.string()).optional(),
      qualifications: z.array(z.string()).optional(),
      aboutCompany: z.string().optional(),
      status: z.nativeEnum(JobStatus).optional(),
    })
    .strict(),
});

export const JobValidations = {
  createJobValidation,
  updateJobValidation,
};

import { z } from 'zod';
import { SalaryType } from './jobSeeker.constants';

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
      overview: z
        .string()
        .nonempty('Overview cannot be empty')
        .max(500)
        .optional(),
      about: z.string().nonempty('About cannot be empty').max(2000).optional(),
      experiences: z.array(experienceSchema).optional(),
      doc: z.string().optional(),
      image: z.string().optional(),
      removedImages: z.array(z.string()).optional(),
      isProfileVisible: z.boolean().default(true).optional(),
    })
    .strict(),
});

export const JobSeekerValidations = {
  jobSeekerSchema,
};

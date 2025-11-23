import { z } from 'zod';
import { SalaryType } from './jobSeeker.constants';

// Work Experience schema
export const experienceSchema = z.object({
  category: z.string(),
  subCategory: z.string(),
  experience: z.number().min(0),
  salaryType: z.nativeEnum(SalaryType),
  salaryAmount: z.number().min(0),
});

// Job Seeker schema
export const createJobSeekerSchema = z.object({
  overview: z.string().nonempty('Overview cannot be empty').max(500).optional(),
  about: z.string().nonempty('About cannot be empty').max(2000).optional(),
  experiences: z.array(experienceSchema).optional(),
  resumeUrl: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export const JobSeekerValidations = {
  createJobSeekerSchema,
};

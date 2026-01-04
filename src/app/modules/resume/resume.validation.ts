import { z } from 'zod';

const licenseSchema = z
  .object({
    carsAndMotorcycles: z.array(z.string()).default([]),
    busesAndAgriculture: z.array(z.string()).default([]),
    trucks: z.array(z.string()).default([]),
  })
  .strict();

const educationSchema = z
  .object({
    degree: z.string().nonempty('Degree cannot be empty'),
    institute: z.string().nonempty('Institute cannot be empty'),
    grade: z.string().nonempty('Grade cannot be empty'),
    year: z
      .number({ required_error: 'Year is required' })
      .min(1900, 'Year must be after 1900')
      .max(new Date().getFullYear(), 'Year cannot be in the future'),
  })
  .strict();

const experienceSchema = z
  .object({
    designation: z.string().nonempty('Designation cannot be empty'),
    company: z.string().nonempty('Company cannot be empty'),
    isCurrentlyWorking: z.boolean({
      required_error: 'Is currently working is required',
    }),
    startDate: z
      .string()
      .datetime()
      .refine(d => new Date(d) < new Date(), {
        message: 'Start date must be in the past',
      }),
    endDate: z.string().datetime().nullable().optional(),

    workDetails: z.string().nonempty('Work details cannot be empty'),
    portfolioUrls: z.array(z.string().url()).default([]),
  })
  .strict();

const personalInfoSchema = z
  .object({
    name: z.string().default(''),
    email: z.string().email('Email must be valid').default(''),
    phone: z.string().default(''),
    dob: z
      .string()
      .datetime()
      .refine(d => new Date(d) < new Date(), {
        message: 'Date of birth must be in the past',
      })
      .nullable()
      .optional(),

    image: z.string().default('').optional(),
    presentAddress: z.string().default(''),
    permanentAddress: z.string().default(''),
    aboutMe: z.string().default(''),
  })
  .strict();

export const resumeSchema = z.object({
  body: z
    .object({
      personalInfo: personalInfoSchema.optional(),
      educations: z.array(educationSchema).optional(),
      experiences: z.array(experienceSchema).optional(),
      license: licenseSchema.optional(),
      skills: z.array(z.string()).default([]),
      extraActivities: z.array(z.string()).default([]),
      hobbies: z.array(z.string()).default([]),
    })
    .strict(),
});

export const ResumeValidations = {
  resumeSchema,
};

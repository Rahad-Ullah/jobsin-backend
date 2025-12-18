import { z } from 'zod';
import { PackageInterval } from './package.constants';

// Package creation schema
export const createPackageValidation = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Name is required' })
        .nonempty('Name is required'),
      interval: z.nativeEnum(PackageInterval),
      intervalCount: z
        .number()
        .int()
        .positive('Interval count must be positive'),
      dailyPrice: z.number().nonnegative('Daily price must be non-negative'),
      description: z.string().default(''),
      benefits: z.array(z.string()).default([]),
    })
    .strict(),
});

// Package update schema
export const updatePackageValidation = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Name is required' })
        .nonempty('Name is required')
        .optional(),
      interval: z.nativeEnum(PackageInterval).optional(),
      intervalCount: z
        .number()
        .int()
        .positive('Interval count must be positive')
        .optional(),
      dailyPrice: z
        .number()
        .nonnegative('Unit price must be non-negative')
        .optional(),
      description: z.string().default('').optional(),
      benefits: z.array(z.string()).default([]).optional(),
    })
    .strict(),
});

export const PackageValidations = {
  createPackageValidation,
  updatePackageValidation,
};

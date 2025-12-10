import { z } from 'zod';
import { VerificationStatus } from './verification.constants';

// Verification creation schema
export const createVerificationValidation = z.object({
  body: z
    .object({
      doc: z.array(z.string()).default([]),
    })
    .strict(),
});

// Verification update schema (PATCH)
export const updateVerificationValidation = z.object({
  body: z
    .object({
      status: z.nativeEnum(VerificationStatus).optional(),
    })
    .strict(),
});

export const VerificationValidations = {
  createVerificationValidation,
  updateVerificationValidation,
};

import { z } from 'zod';

const policySchema = z.object({
  body: z
    .object({
      taxPercentage: z.number().default(0),
    })
    .strict(),
});

export const PolicyValidations = {
  policySchema,
};

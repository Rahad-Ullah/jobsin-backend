import { z } from 'zod';

// Subscription creation schema
export const createSubscriptionSchema = z.object({
  body: z.object({
    package: z.string().nonempty('Package cannot be empty'),
  }),
});

export const SubscriptionValidations = {
  createSubscriptionSchema,
};

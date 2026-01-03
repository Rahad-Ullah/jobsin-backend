import { z } from 'zod';

// Subscription creation schema
const createSubscriptionSchema = z.object({
  body: z.object({
    package: z
      .string()
      .nonempty('Package cannot be empty')
      .length(24, 'Invalid package ID'),
  }),
});

// gift subscription schema
const giftSubscriptionSchema = z.object({
  body: z.object({
    user: z
      .string()
      .nonempty('User ID cannot be empty')
      .length(24, 'Invalid user ID'),
    package: z
      .string()
      .nonempty('Package cannot be empty')
      .length(24, 'Invalid package ID'),
  }),
});

export const SubscriptionValidations = {
  createSubscriptionSchema,
  giftSubscriptionSchema,
};

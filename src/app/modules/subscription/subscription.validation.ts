import { z } from 'zod';

// Subscription creation schema
export const createSubscriptionSchema = z.object({
  package: z.string().min(1, 'Package ID is required'),
});

export const SubscriptionValidations = {
  createSubscriptionSchema,
};

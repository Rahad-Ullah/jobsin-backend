import { z } from 'zod';

// MongoDB ObjectId validator (24‑char hex string)
const objectIdSchema = z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ObjectId format',
});

// Feedback creation schema
export const createFeedbackValidation = z.object({
  body: z
    .object({
      user: objectIdSchema,
      rating: z
        .number({ required_error: 'Rating is required' })
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),
      message: z.string().nonempty('Message is required'),
    })
    .strict(),
});

// Feedback update schema (PATCH)
export const updateFeedbackValidation = z.object({
  body: z
    .object({
      rating: z.number().min(1).max(5).optional(),
      message: z.string().optional(),
    })
    .strict(),
});

export const FeedbackValidations = {
  createFeedbackValidation,
  updateFeedbackValidation,
};

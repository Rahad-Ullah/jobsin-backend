import { z } from 'zod';

// MongoDB ObjectId validator (24-char hex string)
const objectIdSchema = z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ObjectId format',
});

// Wishlist creation schema
export const createWishlistValidation = z.object({
  body: z
    .object({
      job: objectIdSchema,
    })
    .strict(),
});

// Wishlist update schema (PATCH)
export const updateWishlistValidation = z.object({
  body: z
    .object({
      isDeleted: z.boolean().optional(),
    })
    .strict(),
});

export const WishlistValidations = {
  createWishlistValidation,
  updateWishlistValidation,
};

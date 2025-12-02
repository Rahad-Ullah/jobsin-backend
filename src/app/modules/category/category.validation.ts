import { z } from 'zod';

// create category validation schema
export const createCategorySchema = z.object({
  body: z
    .object({
      name: z.string().nonempty('Name cannot be empty'),
      subCategories: z.array(z.string()).optional(),
    })
    .strict(),
});

// update category validation schema
export const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().nonempty('Name cannot be empty').optional(),
      subCategories: z.array(z.string()).optional(),
    })
    .strict(),
});

export const CategoryValidations = {
  createCategorySchema,
  updateCategorySchema,
};

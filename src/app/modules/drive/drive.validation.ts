import { z } from 'zod';

// create drive validation
export const createDriveValidation = z.object({
  body: z
    .object({
      name: z.string().nonempty('Name cannot be empty'),
      doc: z.any(),
    })
    .strict(),
});

// update drive validation
export const updateDriveValidation = z.object({
  body: z
    .object({
      name: z.string().nonempty('Name cannot be empty').optional(),
    })
    .strict(),
});

export const DriveValidations = {
  createDriveValidation,
  updateDriveValidation,
};

import { z } from 'zod';

// create device validation
export const createDeviceValidation = z.object({
  body: z
    .object({
      model: z
        .string({ required_error: 'Model is required' })
        .nonempty('Model cannot be empty'),
      os: z
        .string({ required_error: 'OS is required' })
        .nonempty('OS cannot be empty'),
    })
    .strict(),
});

export const DeviceValidations = {
  createDeviceValidation,
};

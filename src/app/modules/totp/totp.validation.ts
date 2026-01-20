import z from 'zod';

// verify token
const verifyTokenZodSchema = z.object({
  body: z
    .object({
      userId: z
        .string()
        .length(24, 'Invalid user id')
        .nonempty('User id is required'),
      otp: z.string().nonempty('OTP is required'),
    })
    .strict(),
});

export const TotpValidations = { verifyTokenZodSchema };

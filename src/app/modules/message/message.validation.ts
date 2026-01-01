import { z } from 'zod';

// Define the validation schema for Message
const createMessageSchema = z.object({
  body: z
    .object({
      chat: z
        .string({ required_error: 'Chat id is required' })
        .nonempty('Chat id is required')
        .length(24, 'Invalid chat id'),
      text: z.string().optional(),
      image: z.string().optional(),
    })
    .strict(),
});

export const MessageValidations = { createMessageSchema };

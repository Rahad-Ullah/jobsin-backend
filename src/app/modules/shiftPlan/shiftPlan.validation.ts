import { z } from 'zod';

// create shift plan validation
export const createShiftPlanValidation = z.object({
  body: z.object({
    worker: z
      .string({ required_error: 'Worker id is required' })
      .length(24, 'Invalid worker id')
      .nonempty('Worker id cannot be empty'),
    shift: z
      .string({ required_error: 'Shift is required' })
      .nonempty('Shift cannot be empty'),
    startTime: z
      .string({ required_error: 'Start time is required' })
      .nonempty('Start time cannot be empty'),
    endTime: z
      .string({ required_error: 'End time is required' })
      .nonempty('End time cannot be empty'),
    days: z.array(z.string().datetime()).min(1, 'At least 1 day is required'),
    tasks: z.array(z.string()).min(1, 'At least 1 task is required'),
    remarks: z.string().optional(),
  }),
});

export const ShiftPlanValidations = {
  createShiftPlanValidation,
};

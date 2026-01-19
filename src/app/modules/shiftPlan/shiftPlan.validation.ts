import { z } from 'zod';
import { ShiftType } from './shiftPlan.constants';

// create shift plan validation
const createShiftPlanValidation = z.object({
  body: z.object({
    worker: z
      .string({ required_error: 'Worker id is required' })
      .length(24, 'Invalid worker id')
      .nonempty('Worker id cannot be empty'),
    plans: z.array(
      z.object({
        shift: z.nativeEnum(ShiftType),
        startTime: z
          .string({ required_error: 'Start time is required' })
          .nonempty('Start time cannot be empty'),
        endTime: z
          .string({ required_error: 'End time is required' })
          .nonempty('End time cannot be empty'),
        days: z
          .array(
            z
              .string()
              .datetime()
              .refine(date => new Date(date) > new Date(), {
                message: 'Date must be in the future',
              }),
          )
          .min(1, 'At least 1 day is required'),
        tasks: z.array(z.string()).min(1, 'At least 1 task is required'),
        remarks: z.string().optional(),
      }),
    ),
  }),
  // .refine(
  //   data => {
  //     const start = new Date(`1970-01-01T${data.startTime}:00Z`);
  //     const end = new Date(`1970-01-01T${data.endTime}:00Z`);
  //     return start < end;
  //   },
  //   {
  //     message: 'Start time must be before end time',
  //     path: ['startTime'],
  //   }
  // ),
});

// update shift plan validation
const updateShiftPlanValidation = z.object({
  body: z.object({
    worker: z.string().length(24, 'Invalid worker id').optional(),
    plans: z.array(
      z.object({
        shift: z.nativeEnum(ShiftType).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        days: z
          .array(
            z
              .string()
              .datetime()
              .refine(date => new Date(date) > new Date(), {
                message: 'Date must be in the future',
              }),
          )
          .min(1, 'At least 1 day is required')
          .optional(),
        tasks: z.array(z.string()).min(1, 'At least 1 task is required'),
        remarks: z.string().optional(),
      }),
    ),
  }),
});

export const ShiftPlanValidations = {
  createShiftPlanValidation,
  updateShiftPlanValidation,
};

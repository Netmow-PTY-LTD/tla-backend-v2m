import { z } from 'zod';

const createScheduledJobValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    task: z.string({
      required_error: 'Task is required',
    }),
    cron: z.string().optional(),
    active: z.boolean().default(true),
    runner: z.enum(['cron', 'bullmq'], {
      required_error: 'Runner is required',
    }),
    queueName: z.string().optional(),
    payload: z.record(z.any()).optional(),
    attempts: z.number().optional(),
    priority: z.number().optional(),
    delay: z.number().optional(),
  }),
});

const updateScheduledJobValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    task: z.string().optional(),
    cron: z.string().optional(),
    active: z.boolean().optional(),
    runner: z.enum(['cron', 'bullmq']).optional(),
    queueName: z.string().optional(),
    payload: z.record(z.any()).optional(),
    attempts: z.number().optional(),
    priority: z.number().optional(),
    delay: z.number().optional(),
  }),
});

export const ScheduledJobValidation = {
  createScheduledJobValidationSchema,
  updateScheduledJobValidationSchema,
};

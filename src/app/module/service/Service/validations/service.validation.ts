import { z } from 'zod';

export const ServiceValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string(),
  }),
});

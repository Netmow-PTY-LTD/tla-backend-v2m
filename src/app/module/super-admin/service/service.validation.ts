import { string, z } from 'zod';

export const ServiceValidationSchema = z.object({
  body: z.object({
    _id: z.string().optional(),
    slug: z.string(),
    respondAt: string().optional(),
    reviewedAt: string().optional(),
    completedAt: string().optional(),
  }),
});

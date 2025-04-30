import { z } from 'zod';

export const optionGroupValidationSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  slug: z.string().min(1, 'Slug is required').trim().toLowerCase(),
  respondAt: z.array(z.date()).min(1, 'At least one date is required'),
});

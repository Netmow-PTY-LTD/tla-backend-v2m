import mongoose from 'mongoose';
import { z } from 'zod';

export const optionValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    slug: z.string().min(1, 'Slug is required').trim().toLowerCase(),
    option_group_obj: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for option_group_obj',
      }),
    respondAt: z
      .array(z.date())
      .min(1, 'At least one respondAt date is required'),
  }),
});

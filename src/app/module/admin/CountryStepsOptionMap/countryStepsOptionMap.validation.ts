import mongoose from 'mongoose';
import { z } from 'zod';

// Utility for ObjectId check
const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
  });

export const countryStepsOptionMapValidationSchema = z.object({
  body: z.object({
    step_ref: objectId,
    service_ref: objectId,
    option_group_ref: objectId,
    option_ids: z.array(objectId).min(1, 'At least one option ID is required'),
    country_ref: objectId,
    respondAt: z
      .array(z.date())
      .length(3, 'Exactly 3 respondAt dates are required'),
  }),
});

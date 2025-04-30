import mongoose from 'mongoose';
import { z } from 'zod';

// Utility validator for ObjectId
const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
  });

export const stepsCountryWiseOptionGroupsMapValidationSchema = z.object({
  body: z.object({
    option_group_name: z.string().min(1, 'must be add option group name'),
    service_ref: objectId,
    country_ref: objectId,
    step_serial: z.number().optional(),
    respondAt: z
      .array(z.date())
      .length(3, 'Exactly 3 respondAt dates are required'),
  }),
});

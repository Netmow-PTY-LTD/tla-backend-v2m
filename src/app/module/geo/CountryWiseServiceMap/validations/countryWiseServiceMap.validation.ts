import mongoose from 'mongoose';
import { z } from 'zod';

export const countryWiseServiceMapValidationSchema = z.object({
  body: z.object({
    country_obj: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for country_obj',
      }),

    service_id: z
      .array(
        z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
          message: 'Each service_id must be a valid ObjectId',
        }),
      )
      .min(1, 'At least one service_id is required'),

    respondAt: z
      .array(z.date())
      .length(3, 'Exactly 3 respondAt dates are required'),
  }),
});

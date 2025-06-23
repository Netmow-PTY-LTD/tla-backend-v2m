import mongoose from 'mongoose';
import { z } from 'zod';

export const OptionZodSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, { message: 'Name is required' }),
    slug: z.string().trim().min(1, { message: 'Slug is required' }),
    countryId: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid countryId',
      }),
    serviceId: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid serviceId',
      }),
    questionId: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid questionId',
      }),
    selected_options: z
      .array(
        z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
          message: 'Invalid ObjectId in selected_options',
        }),
      )
      .optional()
      .default([]),
  }),
});

export const OptionZodValidation = {
  OptionZodSchema,
};

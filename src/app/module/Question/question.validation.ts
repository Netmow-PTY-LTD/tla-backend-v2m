import mongoose from 'mongoose';
import { z } from 'zod';

const ServiceWiseStepZodSchema = z.object({
  body: z.object({
    countryId: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for countryId',
      }),
    serviceId: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for serviceId',
      }),
    question: z.string().trim().min(1, { message: 'Question is required' }),
    slug: z
      .string()
      .trim()
      .min(1, { message: 'Slug is required' })
      .max(100, { message: 'Slug should be less than 100 characters' }),
    questionType: z.enum(['radio', 'checkbox']),
  }),
});

const updateServiceWiseStepZodSchema = z.object({
  body: z.object({
    countryId: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for countryId',
      })
      .optional(),
    serviceId: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for serviceId',
      })
      .optional(),
    question: z
      .string()
      .trim()
      .min(1, { message: 'Question is required' })
      .optional(),
    slug: z
      .string()
      .trim()
      .min(1, { message: 'Slug is required' })
      .max(100, { message: 'Slug should be less than 100 characters' }),
    questionType: z.enum(['radio', 'checkbox']).optional(),
  }),
});

export const serviceWiseStepZodValidation = {
  ServiceWiseStepZodSchema,
  updateServiceWiseStepZodSchema,
};

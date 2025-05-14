import { z } from 'zod';

const serviceValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string(),
  }),
});
const updateServiceValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
  }),
});

export const serviceZodValidation = {
  serviceValidationSchema,
  updateServiceValidationSchema,
};

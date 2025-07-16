import { z } from 'zod';

const categoryValidationSchema = z.object({
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

export const categoryZodValidation = {
  categoryValidationSchema,
  updateServiceValidationSchema,
};

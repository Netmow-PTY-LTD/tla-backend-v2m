import { z } from 'zod';

// Validation schema for resetting password (requires email and new password)
const countryZodValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Name must be at least 1 characters')
      .trim()
      .nonempty('Name is required'),
    slug: z
      .string()
      .min(1, 'Slug must be at least 1 characters')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      )
      .nonempty('Slug is required')
      .trim(),
  }),
});

const updateCountryZodValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Name must be at least 1 characters')
      .trim()
      .nonempty('Name is required')
      .optional(),
    slug: z
      .string()
      .min(1, 'Slug must be at least 1 characters')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      )
      .nonempty('Slug is required')
      .trim()
      .optional(),
  }),
});

// Exporting all validation schemas
export const countryZodValidation = {
  countryZodValidationSchema,
  updateCountryZodValidationSchema,
};

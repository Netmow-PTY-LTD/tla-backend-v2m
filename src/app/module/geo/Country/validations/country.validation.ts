import { z } from 'zod';

// Validation schema for resetting password (requires email and new password)
const countryZodValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .trim()
      .nonempty('Name is required'),
    slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      )
      .nonempty('Slug is required')
      .trim(),
  }),
});

// Exporting all validation schemas
export const countryZodValidation = {
  countryZodValidationSchema,
};

import { z } from 'zod';

const zipcodeZodValidationSchema = z.object({
  body: z.object({
    zipcode: z
      .string({
        required_error: 'Zipcode is required',
      })
      .trim()
      .min(1, 'Zipcode cannot be empty'),

    countryId: z
      .string({
        required_error: 'Country ID is required',
      })
      .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
        message: 'Invalid MongoDB ObjectId',
      }),
  }),
});

const updateZipcodeZodValidationSchema = z.object({
  body: z.object({
    zipcode: z
      .string({
        required_error: 'Zipcode is required',
      })
      .trim()
      .min(1, 'Zipcode cannot be empty')
      .optional(),

    countryId: z
      .string({
        required_error: 'Country ID is required',
      })
      .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
        message: 'Invalid MongoDB ObjectId',
      })
      .optional(),
  }),
});

// Exporting all validation schemas
export const zipcodeZodValidation = {
  zipcodeZodValidationSchema,
  updateZipcodeZodValidationSchema,
};

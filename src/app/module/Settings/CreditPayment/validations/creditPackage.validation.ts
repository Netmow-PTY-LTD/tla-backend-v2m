import { z } from 'zod';

const creditPackageValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Package name is required'),
    credit: z.number().min(1, 'Credit amount must be at least 1'),
    price: z.number().min(0, 'Price is required and must be a positive number'),
    priceDisplay: z.string().optional(), // Optional display string
    pricePerCredit: z.string().optional(), // Optional string like "£0.50/credit"
    discountPercentage: z
      .number()
      .min(0, 'Discount must be 0 or more')
      .max(100, 'Discount cannot exceed 100')
      .optional()
      .default(0),
    isActive: z.boolean().optional().default(true),
  }),
});

export const creditPackageUpdateValidationSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Package name is required').optional(),
      credit: z.number().min(1, 'Credit amount must be at least 1').optional(),
      price: z.number().min(0, 'Price must be a positive number').optional(),
      priceDisplay: z.string().optional(),
      pricePerCredit: z.string().optional(),
      discountPercentage: z
        .number()
        .min(0, 'Discount must be 0 or more')
        .max(100, 'Discount cannot exceed 100')
        .optional(),
      isActive: z.boolean().optional(),
    })
    .partial(), // Makes all fields optional for partial updates
});

export const creditPackageZodValidation = {
  creditPackageValidationSchema,
  creditPackageUpdateValidationSchema,
};

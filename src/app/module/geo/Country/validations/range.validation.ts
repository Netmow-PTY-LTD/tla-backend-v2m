import { z } from 'zod';
import { zodObjectIdField } from '../../../../utils/validateObjectId';

const rangeZodValidationSchema = z.object({
  body: z.object({
    country: zodObjectIdField('country'),
    zipCode: zodObjectIdField('zip code'),
    name: z.string().min(2, 'Name too short').max(50, 'Name too long'),
    value: z.number().min(0, 'Range must be a positive number'),
    unit: z.enum(['km', 'miles']).default('km'),
  }),
});

// Exporting all validation schemas
export const rangeZodValidation = {
  rangeZodValidationSchema,
};

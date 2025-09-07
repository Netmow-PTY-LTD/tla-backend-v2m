import { z } from 'zod';
import { zodObjectIdField } from '../../utils/validateObjectId';

const leadZodValidationSchema = z.object({
  body: z.object({
    userProfileId: zodObjectIdField('user profile '),
    service_id: zodObjectIdField('service'),
  }),
});

const updateLeadZodValidationSchema = z.object({
  body: z.object({
    userProfileId: zodObjectIdField('user profile ').optional(),
    service_id: zodObjectIdField('service').optional(),
  }),
});

// Exporting all validation schemas
export const leadZodValidation = {
  leadZodValidationSchema,
  updateLeadZodValidationSchema,
};

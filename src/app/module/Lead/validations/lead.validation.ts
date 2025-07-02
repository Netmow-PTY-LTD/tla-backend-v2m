import { z } from 'zod';
import { zodObjectIdField } from '../../../utils/validateObjectId';

const leadZodValidationSchema = z.object({
  body: z.object({
    userProfileId: zodObjectIdField('user profile '),
    serviceId: zodObjectIdField('service'),
    locationId: zodObjectIdField('location'),
    additionalDetails: z.string().optional().default(''),
    budgetAmount: z.number().min(0).default(0),
  }),
});

const updateLeadZodValidationSchema = z.object({
  body: z.object({
    userProfileId: zodObjectIdField('user profile '),
    serviceId: zodObjectIdField('service'),
    locationId: zodObjectIdField('location'),
    additionalDetails: z.string().optional().default(''),
    budgetAmount: z.number().min(0).default(0),
  }),
});


// Exporting all validation schemas
export const leadZodValidation = {
  leadZodValidationSchema,
  updateLeadZodValidationSchema,
};







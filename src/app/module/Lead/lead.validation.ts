import { z } from 'zod';
import { zodObjectIdField } from '../../utils/validateObjectId';
import { leadPrioritySchema, leadStatusSchema } from './lead.constant';

const leadZodValidationSchema = z.object({
  body: z.object({
    userProfileId: zodObjectIdField('user profile '),
    serviceId: zodObjectIdField('service'),
    locationId: zodObjectIdField('location'),
    additionalDetails: z.string().optional().default(''),
    budgetAmount: z.number().min(0).default(0),
    credit: z.number().min(0).default(0),
    status:leadStatusSchema,
    leadPriority: leadPrioritySchema,
  }),
});

const updateLeadZodValidationSchema = z.object({
  body: z.object({
    userProfileId: zodObjectIdField('user profile '),
    serviceId: zodObjectIdField('service'),
    locationId: zodObjectIdField('location'),
    additionalDetails: z.string().optional().default(''),
    budgetAmount: z.number().min(0).default(0),
    credit: z.number().min(0).default(0),
    status:leadStatusSchema.optional(),
    leadPriority: leadPrioritySchema.optional(),
  }),
});


// Exporting all validation schemas
export const leadZodValidation = {
  leadZodValidationSchema,
  updateLeadZodValidationSchema,
};







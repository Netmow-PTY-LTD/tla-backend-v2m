import { z } from 'zod';
import { zodObjectIdField } from '../../../utils/validateObjectId';

export const updateLeadServiceAnswersSchema = z.object({
  body: z.object({
    answers: z
      .array(
        z.object({
          questionId: zodObjectIdField('questionId').optional(),
          selectedOptionIds: z.array(zodObjectIdField('OptionId')).optional(),
        }),
      )
      .optional(),
  }),
});

export const createLeadServiceSchema = z.object({
  body: z.object({
    serviceIds: z
      .array(zodObjectIdField('serviceId'))
      .min(1, 'At least one service is required'),
    locations: z
      .array(z.string({ invalid_type_error: 'location must be string value' }))
      .transform((val) => (val.length === 0 ? ['Nationwide'] : val))
      .optional(),
    onlineEnabled: z.boolean().optional().default(false),
  }),
});

export const leadServiceZodValidation = {
  updateLeadServiceAnswersSchema,
  createLeadServiceSchema,
};

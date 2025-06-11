import { z } from 'zod';

import { zodObjectIdField } from '../../../../utils/validateObjectId';

export const countryServiceFieldSchema = z.object({
  countryId: zodObjectIdField('country').optional(),
  serviceId: zodObjectIdField('service').optional(),
  thumbImage: z.string().url({ message: 'Invalid thumbImage URL' }).optional(),
  bannerImage: z
    .string()
    .url({ message: 'Invalid bannerImage URL' })
    .optional(),
  baseCredit: z
    .number()
    .min(0, { message: 'baseCredit must be >= 0' })
    .optional(),
  deletedAt: z.union([z.date(), z.null()]).optional().optional(),
});

export const countryServiceFieldZodValidation = {
  countryServiceFieldSchema,
};

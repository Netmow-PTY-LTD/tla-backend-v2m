import { z } from 'zod';

import { Types } from 'mongoose';

// Custom ObjectId validation (optional)
const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

const createCountryWiseServiceSchema = z.object({
  body: z.object({
    countryId: objectId.optional(),
    serviceIds: z
      .array(objectId)
      .nonempty({ message: 'At least one serviceId is required' }),
  }),
});

const updateCountryWiseServiceSchema = z.object({
  body: z.object({
    countryId: objectId.optional(),
    serviceIds: z.array(objectId).optional(),
  }),
});

export const CountryWiseServiceZodValidation = {
  createCountryWiseServiceSchema,
  updateCountryWiseServiceSchema,
};

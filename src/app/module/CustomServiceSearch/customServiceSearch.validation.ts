import { z } from 'zod';

const logCustomServiceSearchSchema = z.object({
    body: z.object({
        searchTerm: z.string({ required_error: 'searchTerm is required' }).min(1, 'searchTerm cannot be empty').max(255),
        source: z.enum(['lead', 'draft', 'anonymous']).optional(),
        countryId: z.string().optional(),
        serviceId: z.string().optional(),
        leadId: z.string().optional(),
        draftId: z.string().optional(),
        sessionId: z.string().optional(),
    }),
});

export const customServiceSearchValidation = {
    logCustomServiceSearchSchema,
};

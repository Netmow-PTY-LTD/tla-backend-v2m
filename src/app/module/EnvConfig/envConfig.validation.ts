import { z } from 'zod';

const updateConfigSchema = z.object({
    body: z.object({
        value: z.string().min(1, 'Value is required'),
    }),
});

const bulkUpdateConfigSchema = z.object({
    body: z.object({
        configs: z
            .array(
                z.object({
                    key: z.string().min(1, 'Key is required'),
                    value: z.string().min(1, 'Value is required'),
                })
            )
            .min(1, 'At least one configuration update is required'),
    }),
});

const syncFromEnvSchema = z.object({
    body: z
        .object({
            force: z.boolean().optional().default(false),
        })
        .optional(),
});

export const envConfigValidation = {
    updateConfigSchema,
    bulkUpdateConfigSchema,
    syncFromEnvSchema,
};

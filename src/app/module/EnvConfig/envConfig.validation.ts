import { z } from 'zod';

const updateConfigSchema = z.object({
    body: z.object({
        value: z.string().min(1, 'Value is required'),
        group: z.string().optional(),
        type: z.enum(['string', 'number', 'boolean', 'url', 'email']).optional(),
        isSensitive: z.boolean().optional(),
        requiresRestart: z.boolean().optional(),
        description: z.string().optional(),
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

const createConfigSchema = z.object({
    body: z.object({
        key: z.string().min(1, 'Key is required').regex(/^[A-Z0-9_]+$/, 'Key must be uppercase, numbers or underscores'),
        value: z.string().min(1, 'Value is required'),
        group: z.string().optional(),
        type: z.enum(['string', 'number', 'boolean', 'url', 'email']).optional(),
        isSensitive: z.boolean().optional(),
        requiresRestart: z.boolean().optional(),
        description: z.string().optional(),
    }),
});

export const envConfigValidation = {
    createConfigSchema,
    updateConfigSchema,
    bulkUpdateConfigSchema,
    syncFromEnvSchema,
};

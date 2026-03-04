import { z } from 'zod';

const createEmailTemplateValidationSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: 'Title is required',
        }),
        templateKey: z.string({
            required_error: 'Template Key is required',
        }),
        subject: z.string({
            required_error: 'Subject is required',
        }),
        body: z.string({
            required_error: 'Body is required',
        }),
        variables: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
    }),
});

const updateEmailTemplateValidationSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        templateKey: z.string().optional(),
        subject: z.string().optional(),
        body: z.string().optional(),
        variables: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
    }),
});

export const EmailTemplateValidation = {
    createEmailTemplateValidationSchema,
    updateEmailTemplateValidationSchema,
};

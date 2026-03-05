

/**
 * Helper to replace dynamic variables in templates
 * Example: "Hello {{name}}" -> "Hello John"
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const replaceVariables = (template: string, data: Record<string, any>) => {
    let result = template;
    for (const key in data) {
        const value = data[key];
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
};

export const emailService = {
    replaceVariables,
};

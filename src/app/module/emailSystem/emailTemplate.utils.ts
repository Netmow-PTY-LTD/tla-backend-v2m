/**
 * Replace placeholders in a string with data from an object.
 * Supports both {{variable}} and ${variable} syntax.
 * 
 * @param template The string containing placeholders
 * @param data The object containing key-value pairs for substitution
 * @returns The interpolated string
 */
export const interpolate = (template: string, data: Record<string, string | number | boolean | null | undefined>): string => {
    if (!template) return '';
    if (!data) return template;

    return template.replace(/(\{\{|\$\{)(.+?)(\}\|\})/g, (match, p1, p2) => {
        const key = p2.trim();
        const value = data[key];
        return value !== undefined && value !== null ? String(value) : match;
    });
};

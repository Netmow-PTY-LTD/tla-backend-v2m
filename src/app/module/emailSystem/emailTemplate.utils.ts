/**
 * Replace placeholders in a string with data from an object.
 * Supports both {{variable}} and ${variable} syntax.
 * Array values are automatically joined with ", ".
 *
 * @param template The string containing placeholders
 * @param data The object containing key-value pairs for substitution
 * @returns The interpolated string
 */
export const interpolate = (
    template: string,
    data: Record<string, string | number | boolean | null | undefined | string[] | unknown>
): string => {
    if (!template) return '';
    if (!data) return template;

    let result = template;

    // Replace {{key}} syntax — must close with }}
    result = result.replace(/\{\{([^}]+)\}\}/g, (_match, key) => {
        const trimmedKey = key.trim();
        const value = data[trimmedKey];
        if (value === undefined || value === null) return _match;
        if (Array.isArray(value)) return value.join(', ');
        return String(value);
    });

    // Replace ${key} syntax — must close with single }
    result = result.replace(/\$\{([^}]+)\}/g, (_match, key) => {
        const trimmedKey = key.trim();
        const value = data[trimmedKey];
        if (value === undefined || value === null) return _match;
        if (Array.isArray(value)) return value.join(', ');
        return String(value);
    });

    return result;
};

import httpStatus from 'http-status';

export const HTTP_STATUS = httpStatus;

// Optional: Type alias for values (e.g., 200, 404)
export type HttpStatusCode = (typeof httpStatus)[keyof typeof httpStatus];

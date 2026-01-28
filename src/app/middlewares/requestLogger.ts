import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Define user type structure
interface UserInfo {
    userId: string;
    email?: string;
    role?: string;
}

/**
 * Middleware to log detailed API request information
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const userInfo = (req as Request & { user?: UserInfo }).user;
    const startTime = Date.now();

    // Log request details
    const requestInfo = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: userInfo?.userId || 'anonymous',
        userEmail: userInfo?.email || 'N/A',
        userRole: userInfo?.role || 'N/A',
    };

    // Log incoming request
    logger.info(`Incoming Request: ${JSON.stringify(requestInfo)}`);

    // Capture response
    const originalSend = res.send;
    res.send = function (data: unknown): Response {
        const duration = Date.now() - startTime;

        const responseInfo = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: userInfo?.userId || 'anonymous',
        };

        // Log response
        if (res.statusCode >= 400) {
            logger.warn(`Request Failed: ${JSON.stringify(responseInfo)}`);
        } else {
            logger.info(`Request Completed: ${JSON.stringify(responseInfo)}`);
        }

        return originalSend.call(this, data);
    };

    next();
};

export default requestLogger;

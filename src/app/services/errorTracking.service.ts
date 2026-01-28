import logger from '../utils/logger';

interface ErrorLog {
    timestamp: string;
    method: string;
    endpoint: string;
    statusCode: number;
    errorMessage: string;
    errorStack?: string;
    userId?: string;
    userEmail?: string;
    requestBody?: Record<string, unknown>;
    requestParams?: Record<string, unknown>;
    requestQuery?: Record<string, unknown>;
}

/**
 * Service to track and analyze errors in production
 */
class ErrorTrackingService {
    /**
     * Log a detailed error with context
     */
    logError(errorLog: ErrorLog) {
        const logMessage = `
╔════════════════════════════════════════════════════════════════
║ ERROR OCCURRED
╠════════════════════════════════════════════════════════════════
║ Timestamp:     ${errorLog.timestamp}
║ Method:        ${errorLog.method}
║ Endpoint:      ${errorLog.endpoint}
║ Status Code:   ${errorLog.statusCode}
║ User ID:       ${errorLog.userId || 'N/A'}
║ User Email:    ${errorLog.userEmail || 'N/A'}
║ Error Message: ${errorLog.errorMessage}
╠════════════════════════════════════════════════════════════════
║ Request Details:
║ - Params: ${JSON.stringify(errorLog.requestParams || {})}
║ - Query:  ${JSON.stringify(errorLog.requestQuery || {})}
║ - Body:   ${JSON.stringify(errorLog.requestBody || {}).substring(0, 200)}...
╠════════════════════════════════════════════════════════════════
║ Stack Trace:
║ ${errorLog.errorStack || 'N/A'}
╚════════════════════════════════════════════════════════════════
    `;

        logger.error(logMessage);
    }

    /**
     * Log API endpoint activity
     */
    logApiActivity(options: {
        endpoint: string;
        method: string;
        userId?: string;
        statusCode: number;
        duration: number;
    }) {
        const { endpoint, method, userId, statusCode, duration } = options;

        const message = `API Activity | ${method} ${endpoint} | User: ${userId || 'anonymous'} | Status: ${statusCode} | Duration: ${duration}ms`;

        if (statusCode >= 400) {
            logger.warn(message);
        } else {
            logger.info(message);
        }
    }

    /**
     * Log critical system events
     */
    logCriticalEvent(event: string, details?: Record<string, unknown>) {
        logger.error(`🚨 CRITICAL EVENT: ${event}`, details ? JSON.stringify(details) : '');
    }

    /**
     * Log user authentication events
     */
    logAuthEvent(type: 'login' | 'logout' | 'register' | 'failed_login', userId?: string, details?: Record<string, unknown>) {
        const message = `Auth Event [${type.toUpperCase()}] | User: ${userId || 'unknown'} | ${details ? JSON.stringify(details) : ''}`;
        logger.info(message);
    }

    /**
     * Log database operations
     */
    logDatabaseOperation(operation: string, collection: string, success: boolean, duration?: number) {
        const message = `DB Operation | ${operation} on ${collection} | Success: ${success} | Duration: ${duration || 'N/A'}ms`;

        if (success) {
            logger.info(message);
        } else {
            logger.error(message);
        }
    }
}

export default new ErrorTrackingService();

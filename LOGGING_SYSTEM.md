# Production Error Tracking & Logging System

## Overview
This backend project now includes a comprehensive production-ready logging and error tracking system that helps you monitor API endpoints, track errors, and debug issues in production environments.

## Features Implemented

### 1. **Security with Helmet** 🔒
- Helmet middleware protects the app from common web vulnerabilities
- Sets security-related HTTP headers automatically
- Located in: `src/app.ts`

### 2. **Request Logging with Morgan & Winston** 📝
- **Morgan**: HTTP request logger middleware
- **Winston**: Powerful logging library with multiple transports
- All HTTP requests are automatically logged with:
  - Request method, URL, IP address
  - User agent
  - Response status code
  - Request duration

### 3. **Daily Rotating Log Files** 📁
All logs are automatically saved to the `logs/` directory with daily rotation:
- **`error-YYYY-MM-DD.log`**: Contains only error-level logs
- **`combined-YYYY-MM-DD.log`**: Contains all logs (info, warn, error)
- Logs are automatically compressed and rotated after:
  - Max file size: 20MB
  - Max retention: 14 days

### 4. **Detailed Error Tracking** 🚨
When an error occurs, the system automatically logs:
- **Timestamp**: When the error occurred
- **HTTP Method & Endpoint**: Where the error happened
- **Status Code**: HTTP status code
- **User Information**: User ID and email (if authenticated)
- **Request Details**: Body, params, and query parameters
- **Error Message & Stack Trace**: Full error details

**Example error log:**
```
╔════════════════════════════════════════════════════════════════
║ ERROR OCCURRED
╠════════════════════════════════════════════════════════════════
║ Timestamp:     2026-01-28T15:45:00.000Z
║ Method:        POST
║ Endpoint:      /api/v1/auth/login
║ Status Code:   401
║ User ID:       anonymous
║ User Email:    N/A
║ Error Message: Invalid credentials
╠════════════════════════════════════════════════════════════════
║ Request Details:
║ - Params: {}
║ - Query:  {}
║ - Body:   {"email":"test@example.com","password":"***"}...
╠════════════════════════════════════════════════════════════════
║ Stack Trace:
║ Error: Invalid credentials
║     at AuthController.login (auth.controller.ts:45:15)
╚════════════════════════════════════════════════════════════════
```

### 5. **Error Tracking Service** 📊
Located at: `src/app/services/errorTracking.service.ts`

This service provides structured logging methods for different scenarios:

#### a. Log API Activity
```typescript
import errorTrackingService from './app/services/errorTracking.service';

errorTrackingService.logApiActivity({
  endpoint: '/api/v1/users',
  method: 'GET',
  userId: '123456',
  statusCode: 200,
  duration: 145
});
```

#### b. Log Authentication Events
```typescript
errorTrackingService.logAuthEvent('login', userId, { ip: req.ip });
errorTrackingService.logAuthEvent('failed_login', undefined, { reason: 'Invalid password' });
```

#### c. Log Critical System Events
```typescript
errorTrackingService.logCriticalEvent('Database connection lost', {
  database: 'MongoDB',
  timestamp: new Date().toISOString()
});
```

#### d. Log Database Operations
```typescript
errorTrackingService.logDatabaseOperation('INSERT', 'users', true, 50);
```

## Files Modified/Created

### Created:
1. `src/app/utils/logger.ts` - Winston logger configuration
2. `src/app/services/errorTracking.service.ts` - Error tracking service
3. `src/app/middlewares/requestLogger.ts` - Detailed request logger middleware
4. `logs/` - Log files directory (gitignored)

### Modified:
1. `src/app.ts` - Added helmet, morgan, and logging middleware
2. `src/server.ts` - Replaced console logs with winston logger
3. `src/app/middlewares/globalErrorhandler.ts` - Enhanced with detailed error tracking
4. `.gitignore` - Added logs directory
5. `package.json` - Added dependencies: helmet, winston, morgan, winston-daily-rotate-file

## How to Use in Production

### 1. **Monitor Logs**
All logs are stored in the `logs/` directory. You can:
- View real-time logs: `tail -f logs/combined-YYYY-MM-DD.log`
- Search for errors: `grep "ERROR" logs/error-*.log`
- Filter by endpoint: `grep "/api/v1/auth" logs/combined-*.log`

### 2. **Track User Actions**
When an error occurs with an authenticated user:
```
Method: POST | URL: /api/v1/posts | User: 123456 | Status: 500
```

### 3. **Debug Production Issues**
Each error log includes:
- **Exact endpoint** where error occurred
- **User context** (who experienced the error)
- **Request payload** (what data caused the error)
- **Complete stack trace** (where in code the error originated)

### 4. **Performance Monitoring**
Track request duration to identify slow endpoints:
```
API Activity | GET /api/v1/users | User: 123456 | Status: 200 | Duration: 1250ms
```

## Environment Variables
No additional environment variables are required. The logger automatically adapts to:
- **Development**: Logs to console with colors + files
- **Production**: Logs to files only

## Log Levels
- `info`: Normal operations (requests, successful operations)
- `warn`: Warning conditions (slow requests, failed auth attempts)
- `error`: Error conditions (exceptions, failures)

## Accessing Logs in Production

### Option 1: Direct File Access
```bash
# SSH into your server
ssh user@your-server.com

# Navigate to project
cd /path/to/tla-backend-v2m

# View today's errors
cat logs/error-$(date +%Y-%m-%d).log

# Search for specific user's errors
grep "User: 123456" logs/combined-*.log
```

### Option 2: Log Aggregation (Recommended)
Consider integrating with log aggregation services:
- **Loggly**
- **Papertrail**
- **Datadog**
- **New Relic**

Add transport to `src/app/utils/logger.ts`:
```typescript
import { Loggly } from 'winston-loggly-bulk';

logger.add(new Loggly({
  token: process.env.LOGGLY_TOKEN,
  subdomain: process.env.LOGGLY_SUBDOMAIN,
  tags: ["tla-backend"],
  json: true
}));
```

## Best Practices

### ✅ DO:
- Review error logs daily in production
- Set up alerts for critical errors
- Monitor request durations for performance issues
- Use the error tracking service for custom logging

### ❌ DON'T:
- Log sensitive data (passwords, tokens, credit cards)
- Commit log files to version control (already gitignored)
- Ignore warning logs - they often precede errors

## Example Use Cases

### Use Case 1: User Reports "Something went wrong"
1. Ask user for approximate time and what they were doing
2. Check logs filtered by user ID and timestamp
3. Find exact error with stack trace
4. Fix the issue with complete context

### Use Case 2: API Performance Issues
1. Search logs for requests with duration > 1000ms
2. Identify slow endpoints
3. Optimize queries or add caching

### Use Case 3: Security Audit
1. Review authentication logs
2. Filter for failed login attempts
3. Identify potential brute force attacks

## No Changes to Business Logic ✅
As requested, this implementation:
- ✅ Does NOT modify existing business logic
- ✅ Does NOT change existing functionality
- ✅ Only ADDS monitoring and logging capabilities
- ✅ Works transparently with all existing code

## Support
For questions or issues with the logging system, refer to:
- Winston documentation: https://github.com/winstonjs/winston
- Morgan documentation: https://github.com/expressjs/morgan
- Helmet documentation: https://helmetjs.github.io/

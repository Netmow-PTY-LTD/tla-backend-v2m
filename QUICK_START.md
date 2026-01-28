# Quick Start Guide - Error Tracking & Logging

## Summary of Changes

### ✅ What Was Added:
1. **Helmet** - Security middleware
2. **Winston** - Advanced logging system
3. **Morgan** - HTTP request logger
4. **Error Tracking Service** - Detailed error logging with context
5. **Daily Rotating Logs** - Automatic log rotation and archiving

### ✅ What Was NOT Changed:
- **No business logic modified**
- **No existing functionality changed**
- **No API endpoints modified**
- **No database schemas changed**

## How It Works

### Automatic Logging
Every request and error is now automatically logged with:
- **Timestamp**
- **HTTP Method & Endpoint**
- **User Information** (if authenticated)
- **Request Duration**
- **Error Details** (if applicable)

### Log Files Location
```
logs/
├── combined-2026-01-28.log    # All logs
├── error-2026-01-28.log       # Only errors
├── combined-2026-01-29.log    # Next day logs
└── ...
```

### Viewing Logs in Production

#### 1. View All Logs
```bash
cat logs/combined-2026-01-28.log
```

#### 2. Watch Real-Time Logs
```bash
tail -f logs/combined-*.log
```

#### 3. View Only Errors
```bash
cat logs/error-2026-01-28.log
```

#### 4. Search for Specific User's Errors
```bash
grep "User: 507f1f77bcf86cd799439011" logs/combined-*.log
```

#### 5. Find Errors on Specific Endpoint
```bash
grep "/api/v1/auth/login" logs/error-*.log
```

#### 6. Find All 500 Errors
```bash
grep "Status: 500" logs/combined-*.log
```

## Production Debugging Examples

### Example 1: User can't log in
**User says:** "I tried to log in at 3:45 PM but got an error"

**Steps:**
```bash
# 1. Filter logs around that time for login endpoint
grep "15:4" logs/combined-2026-01-28.log | grep "/auth/login"

# 2. Look for the error
grep "15:4" logs/error-2026-01-28.log | grep "/auth/login"

# 3. You'll see something like:
# Method: POST | URL: /api/v1/auth/login | Message: Invalid credentials | Stack: ...
```

### Example 2: API is slow
**User says:** "The app is really slow today"

**Steps:**
```bash
# Find requests taking > 1 second (1000ms)
grep "Duration: [0-9][0-9][0-9][0-9]" logs/combined-*.log

# You'll see which endpoints are slow:
# Request Completed: {"method":"GET","url":"/api/v1/users","duration":"2500ms"}
```

### Example 3: Find all errors for a specific user
**User ID:** `507f1f77bcf86cd799439011`

```bash
grep "507f1f77bcf86cd799439011" logs/error-*.log
```

## Using the Error Tracking Service in Your Code

### In Controllers
```typescript
import errorTrackingService from '../services/errorTracking.service';

// Log authentication events
errorTrackingService.logAuthEvent('login', userId, { 
  ip: req.ip 
});

// Log critical events
errorTrackingService.logCriticalEvent('Payment gateway down', {
  gateway: 'Stripe',
  timestamp: new Date()
});

// Log database operations
errorTrackingService.logDatabaseOperation('UPDATE', 'users', true, 125);
```

## File Structure

### New Files Created:
```
src/
├── app/
│   ├── utils/
│   │   └── logger.ts                    # Winston logger config
│   ├── middlewares/
│   │   ├── requestLogger.ts             # Detailed request logger
│   │   └── globalErrorhandler.ts        # Enhanced with tracking
│   └── services/
│       └── errorTracking.service.ts     # Error tracking service

logs/                                     # Log files (gitignored)
├── combined-YYYY-MM-DD.log
└── error-YYYY-MM-DD.log

LOGGING_SYSTEM.md                        # Full documentation
QUICK_START.md                           # This file
```

### Modified Files:
```
src/
├── app.ts                               # Added helmet & morgan
├── server.ts                            # Using logger instead of console
.gitignore                               # Added logs directory
package.json                             # Added new dependencies
```

## Environment Detection

The system automatically detects environment:

**Development:**
- Logs to console (colored)
- Logs to files
- Shows stack traces

**Production:**
- Logs to files only
- Hides stack traces from API responses
- Keeps full stack traces in log files

## Log Rotation

Logs automatically rotate:
- **Daily**: New file each day
- **Size**: Compressed when > 20MB
- **Retention**: Kept for 14 days
- **Format**: Compressed as .gz after rotation

## Testing the System

### 1. Start the server
```bash
npm run dev
```

### 2. Check logs directory created
```bash
ls -la logs/
```

### 3. Make a request
```bash
curl http://localhost:5000/api/v1/auth/login
```

### 4. View the log
```bash
cat logs/combined-$(date +%Y-%m-%d).log
```

You should see:
```
2026-01-28 15:45:00 [TLA-BACKEND] info: Incoming Request: {"method":"POST","url":"/api/v1/auth/login",...}
2026-01-28 15:45:00 [TLA-BACKEND] info: Request Completed: {"method":"POST","statusCode":200,"duration":"145ms"}
```

## Emergency Debugging in Production

If users report issues and you need to debug quickly:

```bash
# 1. SSH to server
ssh user@your-server.com

# 2. Navigate to project
cd /path/to/tla-backend-v2m

# 3. Check recent errors
tail -50 logs/error-$(date +%Y-%m-%d).log

# 4. Watch live errors
tail -f logs/error-*.log

# 5. Search for specific error message
grep -i "database connection" logs/error-*.log

# 6. Count errors by endpoint
grep "ERROR" logs/error-*.log | cut -d'|' -f2 | sort | uniq -c | sort -rn
```

## Performance Impact

**Minimal:**
- Logging is asynchronous
- Log writes are buffered
- No impact on response times
- Negligible memory overhead

## Security Considerations

**What's logged:**
- Request methods, URLs, status codes
- User IDs (not passwords)
- Error messages and stack traces
- Request duration

**What's NOT logged:**
- Passwords
- JWT tokens
- Credit card information
- Other sensitive data

> **Note:** Always review what data you're logging if you modify request/error logging code.

## Next Steps

1. ✅ Build successful (`npm run build`)
2. ✅ All logs configured
3. ✅ Error tracking active
4. ✅ Security headers enabled

**Ready for production!**

For more details, see: [LOGGING_SYSTEM.md](./LOGGING_SYSTEM.md)

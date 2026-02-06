# Environment Configuration Management System

## Overview

This module provides a hassle-free way to manage environment variables through a database interface. Super admins can update environment configurations through API endpoints without needing to manually edit `.env` files or redeploy the application.

## Features

- ✅ **Database Storage**: All environment variables stored in MongoDB
- 🔐 **Encryption**: Sensitive values (API keys, secrets) encrypted using AES-256
- ⚡ **Redis Caching**: 5-minute TTL cache for optimal performance
- 🔄 **Hot Reload**: Most settings update immediately without restart
- 🛡️ **Super Admin Only**: Strict authorization with audit trail
- 📋 **Categorized**: Configs grouped by category (JWT, Email, Payment, etc.)
- 🔁 **Backward Compatible**: Falls back to `.env` if database is empty

## Setup

### 1. Add Encryption Key to `.env`

Generate a secure 64-character hex string for encryption:

```bash
# Using Node.js crypto
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to your `.env` file:

```env
ENV_ENCRYPTION_KEY=your_generated_64_char_hex_string_here
```

### 2. Run Migration Script

Migrate existing `.env` variables to database:

```bash
# From project root
ts-node src/scripts/migrateEnvToDb.ts
```

This will:
- Read all variables from `.env`
- Create database records with proper grouping
- Encrypt sensitive values (JWT secrets, API keys, etc.)
- Skip excluded variables (DATABASE_URL, REDIS_*, etc.)

### 3. Start Application

The application will now load configurations from the database.

## API Endpoints

Base path: `/api/v1/env-config`

All endpoints require **Super Admin** authentication.

### Get All Configurations

```http
GET /api/v1/env-config
Authorization: Bearer {super_admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Environment configurations retrieved successfully",
  "data": {
    "JWT": [
      {
        "key": "JWT_ACCESS_SECRET",
        "value": "***MASKED***",
        "type": "string",
        "isSensitive": true,
        "requiresRestart": false,
        "description": "Secret key for JWT access tokens"
      }
    ],
    "Email": [...]
  }
}
```

### Get Single Configuration

```http
GET /api/v1/env-config/:key
Authorization: Bearer {super_admin_token}
```

**Example:**
```http
GET /api/v1/env-config/MAILGUN_FROM_EMAIL
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration retrieved successfully",
  "data": {
    "key": "MAILGUN_FROM_EMAIL",
    "value": "no-reply@thelawapp.com",
    "group": "Email",
    "type": "email",
    "isSensitive": false,
    "requiresRestart": false
  }
}
```

### Update Single Configuration

```http
PUT /api/v1/env-config/:key
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "value": "new_value_here"
}
```

**Example:**
```bash
curl -X PUT https://yourapi.com/api/v1/env-config/MAILGUN_FROM_EMAIL \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "support@thelawapp.com"}'
```

### Bulk Update Configurations

```http
PUT /api/v1/env-config/bulk/update
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "configs": [
    {
      "key": "JWT_ACCESS_EXPIRES_IN",
      "value": "30m"
    },
    {
      "key": "JWT_REFRESH_EXPIRES_IN",
      "value": "30d"
    }
  ]
}
```

### Sync from .env File

```http
POST /api/v1/env-config/sync/from-env
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "force": false  // Set to true to overwrite existing values
}
```

### Export to .env Format

```http
POST /api/v1/env-config/export/to-env
Authorization: Bearer {super_admin_token}
```

Downloads a `.env.export` file with all current database configurations.

### Reload Configurations

```http
POST /api/v1/env-config/reload
Authorization: Bearer {super_admin_token}
```

Clears cache and reloads all configurations from database.

## Configuration Groups

| Group | Description | Examples |
|-------|-------------|----------|
| **General** | Basic app settings | `PORT`, `CLIENT_SITE_URL` |
| **Security** | Authentication & passwords | `BCRYPT_SALT_ROUNDS`, `DEFAULT_PASS`, `ADMIN_PASSWORD` |
| **JWT** | JWT token configuration | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` |
| **Email** | Email service (Mailgun) | `MAILGUN_SMTP_USER`, `MAILGUN_FROM_EMAIL` |
| **Storage** | File storage (Cloudinary, DO Spaces) | `CLOUDINARY_API_KEY`, `DO_SPACES_BUCKET` |
| **Payment** | Payment processing (Stripe) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **SMS & WhatsApp** | Messaging (Twilio) | `TWILIO_SID`, `TWILIO_AUTH` |
| **Maps & Location** | Google Maps | `GOOGLE_MAPS_API_KEY` |
| **Firm Application** | Firm app settings | `FIRM_CLIENT_URL` |

## Variables NOT Stored in Database

The following variables **must** remain in `.env` file:

| Variable | Reason |
|----------|--------|
| `DATABASE_URL` | Needed to connect to database (chicken-and-egg problem) |
| `ENV_ENCRYPTION_KEY` | Master encryption key for sensitive values |
| `NODE_ENV` | Infrastructure-level configuration |
| `PORT` | Typically managed by deployment platform |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_USERNAME` | Needed for caching bootstrap |

## Restart Requirements

Some configurations require an application restart to take effect:

- `PORT` - Server port number
- `BCRYPT_SALT_ROUNDS` - Password hashing rounds

The API response will indicate when a restart is required:

```json
{
  "message": "Configuration PORT updated successfully. Application restart required for changes to take effect."
}
```

## Usage in Code

The configuration system is transparent to existing code. Use configs as before:

```typescript
import config from './app/config';

// Works exactly as before - loads from database (with cache)
const port = config.port;
const jwtSecret = config.jwt_access_secret;
```

## Security Considerations

1. **Encryption**: All sensitive values are encrypted at rest using AES-256-CBC
2. **Access Control**: Only super admins can view/modify configurations
3. **Audit Trail**: Every change is logged with admin ID and timestamp
4. **Masked Display**: Sensitive values show as `***MASKED***` in list views
5. **Cache Invalidation**: Immediate invalidation on updates

## Caching Strategy

- **Cache TTL**: 5 minutes (300 seconds)
- **Cache Keys**: `ENV_CONFIG:ALL`, `ENV_CONFIG:KEY:{key}`
- **Invalidation**: Automatic on any update
- **Fallback**: Reads from database on cache miss

## Troubleshooting

### Application won't start

**Symptom**: Error on startup
**Solution**: Ensure `.env` file has `DATABASE_URL` and `ENV_ENCRYPTION_KEY`

### Configuration changes not reflected

**Symptom**: Updates via API don't take effect
**Solution**: 
1. Check if Redis is running
2. Call `/api/v1/env-config/reload` to force refresh
3. Restart application if it's a restart-required config

### Encryption/Decryption errors

**Symptom**: "Decryption failed" errors in logs
**Solution**: 
1. Verify `ENV_ENCRYPTION_KEY` is exactly 64 hex characters
2. Don't change encryption key after migration (or re-encrypt all values)

### Migration script fails

**Symptom**: Error during `migrateEnvToDb.ts` execution
**Solution**:
1. Ensure MongoDB is running and accessible
2. Check `DATABASE_URL` is correct in `.env`
3. Verify no duplicate keys exist in database (drop `envconfigs` collection if needed)

## Best Practices

1. **Initial Setup**: Run migration script once during initial deployment
2. **Key Rotation**: Periodically rotate encryption key (requires re-encryption)
3. **Backup**: Keep a backup `.env` file in secure location
4. **Monitoring**: Monitor Redis cache hit/miss rates
5. **Testing**: Always test config changes in staging first

## Development vs Production

### Development
```bash
# Use .env file directly (optional)
# Database will auto-populate on first run if empty
```

### Production
```bash
# 1. Add ENV_ENCRYPTION_KEY to production .env
# 2. Run migration script
# 3. Deploy application
# 4. Verify all services working
```

## Future Enhancements

- [ ] Web UI for managing configs
- [ ] Configuration versioning/history
- [ ] Rollback to previous values
- [ ] Import/export via admin panel
- [ ] Notification on critical config changes
- [ ] Multi-environment support (dev, staging, prod)

# EnvConfig Module - Postman API Documentation

## Base URL
```
{{BASE_URL}}/api/v1/env-config
```

## Authentication
All endpoints require **Super Admin** or **Admin** authentication. Include the authentication token in the header:
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 📋 Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all configurations grouped by category |
| GET | `/:key` | Get single configuration by key |
| PUT | `/:key` | Update single configuration |
| PUT | `/bulk/update` | Bulk update multiple configurations |
| POST | `/sync/from-env` | Sync configurations from .env file |
| POST | `/export/to-env` | Export configurations to .env format |
| POST | `/reload` | Reload configurations from database |

---

## 1️⃣ Get All Configurations

### Request
```http
GET {{BASE_URL}}/api/v1/env-config
Authorization: Bearer {{ACCESS_TOKEN}}
```

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Environment configurations retrieved successfully",
  "data": {
    "Database": [
      {
        "key": "DB_URL",
        "value": "mongodb://localhost:27017/tla",
        "type": "string",
        "isSensitive": true,
        "requiresRestart": true,
        "description": "MongoDB connection URL",
        "isActive": true
      },
      {
        "key": "DB_NAME",
        "value": "tla_database",
        "type": "string",
        "isSensitive": false,
        "requiresRestart": true,
        "description": "Database name",
        "isActive": true
      }
    ],
    "Redis": [
      {
        "key": "REDIS_HOST",
        "value": "localhost",
        "type": "string",
        "isSensitive": false,
        "requiresRestart": true,
        "description": "Redis host",
        "isActive": true
      },
      {
        "key": "REDIS_PORT",
        "value": "6379",
        "type": "number",
        "isSensitive": false,
        "requiresRestart": true,
        "description": "Redis port",
        "isActive": true
      }
    ],
    "Application": [
      {
        "key": "PORT",
        "value": "5000",
        "type": "number",
        "isSensitive": false,
        "requiresRestart": true,
        "description": "Application port",
        "isActive": true
      },
      {
        "key": "NODE_ENV",
        "value": "development",
        "type": "string",
        "isSensitive": false,
        "requiresRestart": true,
        "description": "Node environment",
        "isActive": true
      }
    ],
    "Email": [
      {
        "key": "SMTP_HOST",
        "value": "smtp.gmail.com",
        "type": "string",
        "isSensitive": false,
        "requiresRestart": false,
        "description": "SMTP server host",
        "isActive": true
      },
      {
        "key": "SMTP_PORT",
        "value": "587",
        "type": "number",
        "isSensitive": false,
        "requiresRestart": false,
        "description": "SMTP server port",
        "isActive": true
      },
      {
        "key": "SMTP_USER",
        "value": "noreply@example.com",
        "type": "string",
        "isSensitive": true,
        "requiresRestart": false,
        "description": "SMTP username",
        "isActive": true
      }
    ],
    "General": [
      {
        "key": "APP_NAME",
        "value": "TLA Application",
        "type": "string",
        "isSensitive": false,
        "requiresRestart": false,
        "description": "Application name",
        "isActive": true
      }
    ]
  }
}
```

---

## 2️⃣ Get Single Configuration by Key

### Request
```http
GET {{BASE_URL}}/api/v1/env-config/PORT
Authorization: Bearer {{ACCESS_TOKEN}}
```

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Configuration retrieved successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "key": "PORT",
    "value": "5000",
    "group": "Application",
    "type": "number",
    "isSensitive": false,
    "requiresRestart": true,
    "description": "Application port",
    "isActive": true,
    "lastModifiedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  }
}
```

### Response (404 Not Found)
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Configuration INVALID_KEY not found",
  "data": null
}
```

---

## 3️⃣ Update Single Configuration

### Request
```http
PUT {{BASE_URL}}/api/v1/env-config/PORT
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

### Request Body
```json
{
  "value": "8080"
}
```

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Configuration PORT updated successfully. Application restart required for changes to take effect.",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "key": "PORT",
    "value": "8080",
    "group": "Application",
    "type": "number",
    "isSensitive": false,
    "requiresRestart": true,
    "description": "Application port",
    "isActive": true,
    "lastModifiedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-25T09:15:00.000Z"
  }
}
```

### Example: Update Email Configuration (No Restart Required)
```http
PUT {{BASE_URL}}/api/v1/env-config/SMTP_HOST
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

Request Body:
```json
{
  "value": "smtp.sendgrid.net"
}
```

Response:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Configuration SMTP_HOST updated successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "key": "SMTP_HOST",
    "value": "smtp.sendgrid.net",
    "group": "Email",
    "type": "string",
    "isSensitive": false,
    "requiresRestart": false,
    "description": "SMTP server host",
    "isActive": true,
    "lastModifiedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-25T09:20:00.000Z"
  }
}
```

---

## 4️⃣ Bulk Update Configurations

### Request
```http
PUT {{BASE_URL}}/api/v1/env-config/bulk/update
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

### Request Body
```json
{
  "configs": [
    {
      "key": "SMTP_HOST",
      "value": "smtp.sendgrid.net"
    },
    {
      "key": "SMTP_PORT",
      "value": "465"
    },
    {
      "key": "SMTP_USER",
      "value": "apikey"
    },
    {
      "key": "APP_NAME",
      "value": "TLA Application - Production"
    }
  ]
}
```

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "4 configurations updated successfully",
  "data": null
}
```

### Validation Error Example
Request Body (Missing required field):
```json
{
  "configs": [
    {
      "key": "SMTP_HOST"
      // Missing "value" field
    }
  ]
}
```

Response (400 Bad Request):
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation error",
  "errorMessages": [
    {
      "path": "body.configs[0].value",
      "message": "Value is required"
    }
  ]
}
```

---

## 5️⃣ Sync Configurations from .env File

This endpoint syncs environment variables from the `.env` file to the database.

### Request (Normal Sync - Skip Existing)
```http
POST {{BASE_URL}}/api/v1/env-config/sync/from-env
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

### Request Body
```json
{
  "force": false
}
```

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Synced 15 configurations from .env file. Skipped 8.",
  "data": {
    "synced": 15,
    "skipped": 8
  }
}
```

### Request (Force Sync - Overwrite Existing)
```http
POST {{BASE_URL}}/api/v1/env-config/sync/from-env
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

Request Body:
```json
{
  "force": true
}
```

Response:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Synced 23 configurations from .env file. Skipped 0.",
  "data": {
    "synced": 23,
    "skipped": 0
  }
}
```

### Request (Default Behavior - No Body)
```http
POST {{BASE_URL}}/api/v1/env-config/sync/from-env
Authorization: Bearer {{ACCESS_TOKEN}}
```

Response (same as force: false):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Synced 15 configurations from .env file. Skipped 8.",
  "data": {
    "synced": 15,
    "skipped": 8
  }
}
```

---

## 6️⃣ Export Configurations to .env Format

This endpoint exports all configurations from the database to a downloadable `.env` file format.

### Request
```http
POST {{BASE_URL}}/api/v1/env-config/export/to-env
Authorization: Bearer {{ACCESS_TOKEN}}
```

### Response (200 OK)
**Content-Type:** `text/plain`  
**Content-Disposition:** `attachment; filename=".env.export"`

```env
# Environment Configuration Export
# Generated at: 2024-01-25T09:30:00.000Z
# ==============================

# Database
# ==============================
DB_URL=mongodb://localhost:27017/tla
DB_NAME=tla_database

# Redis
# ==============================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_secret_password

# Application
# ==============================
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
BCRYPT_SALT_ROUNDS=10

# Email
# ==============================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=smtp_password

# General
# ==============================
APP_NAME=TLA Application

```

**Note:** The file will be downloaded automatically by the browser. Sensitive values are decrypted before export.

---

## 7️⃣ Reload Configurations from Database

This endpoint reloads configurations from the database and clears the Redis cache.

### Request
```http
POST {{BASE_URL}}/api/v1/env-config/reload
Authorization: Bearer {{ACCESS_TOKEN}}
```

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Configurations reloaded successfully",
  "data": null
}
```

---

## 🔐 Security Notes

1. **Sensitive Data Encryption**: Fields marked with `isSensitive: true` are automatically encrypted in the database using AES-256-CBC encryption.

2. **Authentication Required**: All endpoints require Super Admin or Admin role authentication.

3. **Excluded Variables**: The following environment variables are excluded from sync operations:
   - System-specific variables
   - Sensitive credentials that should remain in `.env` only
   - Check `envConfig.constant.ts` for the complete list

4. **Cache Management**: 
   - Configurations are cached in Redis for 5 minutes
   - Cache is automatically invalidated on updates
   - Use the `/reload` endpoint to force cache refresh

---

## 🚨 Common Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "success": false,
  "message": "You are not authorized to access this resource",
  "errorMessages": []
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "success": false,
  "message": "Insufficient permissions",
  "errorMessages": []
}
```

### 400 Bad Request (Validation Error)
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation error",
  "errorMessages": [
    {
      "path": "body.value",
      "message": "Value is required"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "success": false,
  "message": "Internal server error",
  "errorMessages": []
}
```

---

## 📝 Postman Environment Variables

Set up these variables in your Postman environment:

```json
{
  "BASE_URL": "http://localhost:5000",
  "ACCESS_TOKEN": "your_super_admin_or_admin_jwt_token"
}
```

---

## 🎯 Use Cases

### Use Case 1: Update Email SMTP Settings
```http
PUT {{BASE_URL}}/api/v1/env-config/bulk/update
```
```json
{
  "configs": [
    {"key": "SMTP_HOST", "value": "smtp.sendgrid.net"},
    {"key": "SMTP_PORT", "value": "465"},
    {"key": "SMTP_USER", "value": "apikey"},
    {"key": "SMTP_PASS", "value": "SG.new_api_key"}
  ]
}
```

### Use Case 2: Change Application Port
```http
PUT {{BASE_URL}}/api/v1/env-config/PORT
```
```json
{
  "value": "8080"
}
```
⚠️ **Note**: Restart required after this change.

### Use Case 3: Initial Setup - Sync from .env
```http
POST {{BASE_URL}}/api/v1/env-config/sync/from-env
```
```json
{
  "force": true
}
```

### Use Case 4: Backup Configurations
```http
POST {{BASE_URL}}/api/v1/env-config/export/to-env
```
Download the `.env.export` file as backup.

### Use Case 5: Apply Changes Immediately
```http
POST {{BASE_URL}}/api/v1/env-config/reload
```
Clears cache and reloads configurations without application restart.

---

## 📦 Postman Collection

You can import this collection into Postman for testing:

1. Create a new Collection named "EnvConfig Module"
2. Set up authentication at collection level (Bearer Token)
3. Add each endpoint as a request
4. Use the examples provided above

---

## 🔄 Testing Workflow

1. **Initial Setup**:
   - Sync configurations from .env: `POST /sync/from-env` with `force: true`

2. **View Configurations**:
   - Get all: `GET /`
   - Get specific: `GET /:key`

3. **Update Configurations**:
   - Single update: `PUT /:key`
   - Bulk update: `PUT /bulk/update`

4. **Apply Changes**:
   - Reload cache: `POST /reload`
   - For restart-required configs: Restart the application

5. **Backup**:
   - Export to .env: `POST /export/to-env`

---

**Last Updated**: February 5, 2026  
**Module Version**: 2.0  
**API Version**: v1

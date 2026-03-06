# 📧 Email Campaign API Documentation

This module allows Admins to create, schedule, and track email campaigns targeting The Law App users.

**Base URL Path:** `/api/v1/admin/email-campaigns`  
**Authentication:** `Bearer <JWT_TOKEN>` (Admin role required)

---

## 1. Create a Campaign (`POST /`)
Creates a new campaign. Depending on `scheduleType`, it may send immediately, queue for a future date, or set up a recurring schedule.

### Request Body (Immediate Send - Custom Message)
```json
{
  "title": "Easter Weekend Promotion",
  "templateKey": "admin_custom",
  "subject": "🐰 Special Easter Offer - 20% Off Credits!",
  "customData": {
    "headline": "Happy Easter from The Law App!",
    "body": "To celebrate the long weekend, we're offering a 20% discount on all credit packs purchased before Monday midnight.",
    "ctaLabel": "Claim Your Discount",
    "ctaUrl": "https://thelawapp.com.au/credits?code=EASTER20",
    "footerText": "Terms and conditions apply. Offer valid until April 13th."
  },
  "targetAudience": "all_lawyers",
  "scheduleType": "immediate"
}
```

### Request Body (Standard Template)
```json
{
  "title": "Welcome New Lawyers - March",
  "templateKey": "welcome_to_lawyer",
  "subject": "Welcome to The Law App!",
  "customData": {
    "paracticeArea": "Family Law",
    "dashboardUrl": "https://thelawapp.com.au/dashboard"
  },
  "targetAudience": "all_lawyers",
  "scheduleType": "immediate"
}
```

### Request Body (Scheduled Send)
```json
{
  "title": "Elite Pro Announcement",
  "templateKey": "admin_custom",
  "subject": "Unlock Elite Pro Benefits",
  "customData": {
    "headline": "Upgrade Today!",
    "body": "Check out our new Elite Pro features."
  },
  "targetAudience": "segment",
  "segmentFilter": { "credits": { "$gte": 10 } },
  "scheduleType": "scheduled",
  "scheduledAt": "2026-04-01T10:00:00Z"
}
```

### Response Example (Status 201)
```json
{
  "success": true,
  "message": "Campaign created and dispatching in background",
  "data": {
    "_id": "65e5a2b3c4d5e6f7a8b9c0d1",
    "title": "Welcome New Lawyers - March",
    "templateKey": "welcome_to_lawyer",
    "subject": "Welcome to The Law App!",
    "targetAudience": "all_lawyers",
    "scheduleType": "immediate",
    "status": "queued",
    "sentCount": 0,
    "failedCount": 0,
    "totalTargeted": 0,
    "createdBy": "65e5a2b3c4d5e6f7a8b9c001",
    "createdAt": "2026-03-04T12:00:00.000Z"
  }
}
```

---

## 2. List Campaigns (`GET /`)
Retrieves a paginated list of all campaigns.

### Query Parameters
| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Current page |
| `limit` | `10` | Items per page |
| `status` | - | Filter by status: `draft`, `queued`, `sending`, `sent`, `failed`, `canceled` |
| `scheduleType` | - | Filter by: `immediate`, `scheduled`, `recurring` |
| `search` | - | Search by title (regex) |
| `sortBy` | `createdAt` | Field to sort by |
| `sortOrder` | `desc` | `asc` or `desc` |

### Response Example (Status 200)
```json
{
  "success": true,
  "message": "Campaigns fetched successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPage": 1
  },
  "data": [
    {
      "_id": "65e5a2b3c4d5e6f7a8b9c0d1",
      "title": "Welcome New Lawyers - March",
      "status": "sent",
      "sentCount": 45,
      "totalTargeted": 45,
      "createdAt": "2026-03-04T12:00:00.000Z"
    }
  ]
}
```

---

## 3. Get Campaign Details (`GET /:id`)
Returns full details of a specific campaign, including real-time delivery stats.

### Response Example (Status 200)
```json
{
  "success": true,
  "message": "Campaign details fetched successfully",
  "data": {
    "_id": "65e5a2b3c4d5e6f7a8b9c0d1",
    "title": "Welcome New Lawyers - March",
    "status": "sent",
    "sentCount": 45,
    "failedCount": 0,
    "totalTargeted": 45,
    "deliveryRate": 100,
    "templateKey": "welcome_to_lawyer",
    "targetAudience": "all_lawyers",
    "sentAt": "2026-03-04T12:05:00.000Z",
    "createdBy": {
      "email": "admin@thelawapp.com.au"
    }
  }
}
```

---

## 4. Update Campaign (`PATCH /:id`)
Updates a campaign. Note: Editing is restricted if the campaign status is `sending` or `sent`.

### Request Body
```json
{
  "subject": "Updated: Welcome to The Law App!",
  "title": "Welcome New Lawyers - v2"
}
```

### Response Example (Status 200)
```json
{
  "success": true,
  "message": "Campaign updated successfully",
  "data": {
    "_id": "65e5a2b3c4d5e6f7a8b9c0d1",
    "title": "Welcome New Lawyers - v2",
    "status": "draft"
  }
}
```

---

## 5. Delete or Cancel Campaign (`DELETE /:id`)
Cancels or deletes a campaign.
- **Draft/Queued:** Hard deleted from DB.
- **Sent:** Status updated to `canceled` (data preserved).

### Response Example (Status 200)
```json
{
  "success": true,
  "message": "Campaign deleted successfully",
  "data": {
    "deleted": true,
    "canceled": false
  }
}
```

---

## 6. Force Send Now (`POST /:id/send-now`)
Immediately starts the dispatch of a queued or draft campaign.

### Response Example (Status 200)
```json
{
  "success": true,
  "message": "Campaign dispatch started",
  "data": {
    "message": "Campaign dispatch started",
    "campaignId": "65e5a2b3c4d5e6f7a8b9c0d1"
  }
}
```

---

## 7. Preview Email (`POST /preview`)
Sends a test email to the current Admin's registered email address.

### Request Body
```json
{
  "templateKey": "admin_custom",
  "subject": "Preview Test",
  "customData": {
    "headline": "Testing Template",
    "body": "Hello World!"
  }
}
```

### Response Example (Status 200)
```json
{
  "success": true,
  "message": "Preview email sent to admin@thelawapp.com.au",
  "data": null
}
```

---

## 8. View Delivery Log (`GET /:id/log`)
Returns a paginated log of individual email delivery statuses.

### Query Parameters
| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Current page |
| `limit` | `50` | Entries per page |
| `status` | - | Filter by `sent` or `failed` |

### Response Example (Status 200)
```json
{
  "success": true,
  "message": "Delivery log fetched",
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 45,
    "totalPage": 1
  },
  "data": [
    {
      "email": "user1@example.com",
      "sentAt": "2026-03-04T12:05:01Z",
      "status": "sent"
    },
    {
      "email": "user2@example.com",
      "sentAt": "2026-03-04T12:05:02Z",
      "status": "failed",
      "error": "Address rejected"
    }
  ]
}
```

---

## 9. Utility Endpoints

### List Templates (`GET /templates`)
Returns all valid template keys for the UI dropdown.
```json
{
  "success": true,
  "message": "Available email templates fetched",
  "data": [
    { "key": "welcome_to_lawyer", "label": "Welcome – Lawyer" },
    { "key": "admin_custom", "label": "Custom Admin Message" }
  ]
}
```

### List Segment Presets (`GET /segments`)
Returns predefined audience segments.
```json
{
  "success": true,
  "message": "Segment presets fetched",
  "data": [
    { "id": "lawyers_zero_credits", "label": "Lawyers with 0 credits" },
    { "id": "elite_pro_subscribers", "label": "Elite Pro subscribers" }
  ]
}
```

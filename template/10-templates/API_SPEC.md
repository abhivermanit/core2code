# API Specification: [API Name]

**Version:** 1.0.0
**Base URL:** `https://api.example.com/v1`
**Author:** [Name]
**Date:** [YYYY-MM-DD]

---

## Authentication

All requests require an API key in the header:

```http
X-API-Key: sk_live_your_api_key_here
```

API keys are scoped to specific permissions. See [API Key Management](#) for details.

## Common Headers

| Header | Required | Description |
|--------|----------|-------------|
| X-API-Key | Yes | Your API key |
| Content-Type | Yes (POST/PUT) | application/json |
| X-Request-Id | No | Client-generated request ID for tracing |

## Rate Limits

| Plan | Limit | Window |
|------|-------|--------|
| Free | 60 requests | per minute |
| Pro | 1000 requests | per minute |
| Enterprise | Custom | Custom |

Rate limit headers included in every response:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1710523200
```

## Pagination

Cursor-based pagination on all list endpoints:

```http
GET /v1/resources?limit=20&cursor=eyJpZCI6MTIzfQ
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "has_more": true,
    "next_cursor": "eyJpZCI6MTQzfQ"
  }
}
```

## Error Format

All errors follow this structure:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Human-readable description",
    "details": [],
    "request_id": "req_abc123"
  }
}
```

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | validation_error | Request body/params invalid |
| 401 | unauthorized | Missing or invalid API key |
| 403 | forbidden | Valid key, insufficient permissions |
| 404 | not_found | Resource doesn't exist |
| 409 | conflict | Duplicate or state conflict |
| 429 | rate_limit_exceeded | Too many requests |
| 500 | internal_error | Server error (contact support) |

---

## Endpoints

### [Resource Name]

#### List [Resources]

```http
GET /v1/resources
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 20 | Max items (1-100) |
| cursor | string | - | Pagination cursor |
| status | string | - | Filter by status |
| sort | string | created_at | Sort field |
| order | string | desc | Sort direction (asc/desc) |

**Response: 200 OK**

```json
{
  "data": [
    {
      "id": "res_abc123",
      "name": "Example Resource",
      "status": "active",
      "created_at": "2024-03-15T14:30:00Z",
      "updated_at": "2024-03-15T14:30:00Z"
    }
  ],
  "pagination": {
    "has_more": true,
    "next_cursor": "eyJpZCI6MTQzfQ"
  }
}
```

#### Get [Resource]

```http
GET /v1/resources/:id
```

**Response: 200 OK**

```json
{
  "data": {
    "id": "res_abc123",
    "name": "Example Resource",
    "status": "active",
    "created_at": "2024-03-15T14:30:00Z",
    "updated_at": "2024-03-15T14:30:00Z"
  }
}
```

#### Create [Resource]

```http
POST /v1/resources
```

**Request Body:**

```json
{
  "name": "New Resource",
  "description": "Optional description"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Resource name (1-255 chars) |
| description | string | No | Optional description |

**Response: 201 Created**

```json
{
  "data": {
    "id": "res_def456",
    "name": "New Resource",
    "status": "active",
    "created_at": "2024-03-15T15:00:00Z",
    "updated_at": "2024-03-15T15:00:00Z"
  }
}
```

#### Update [Resource]

```http
PATCH /v1/resources/:id
```

**Request Body:** (only include fields to update)

```json
{
  "name": "Updated Name"
}
```

**Response: 200 OK**

#### Delete [Resource]

```http
DELETE /v1/resources/:id
```

**Response: 204 No Content**

---

## Webhooks

### Event Types

| Event | Description |
|-------|-------------|
| resource.created | New resource created |
| resource.updated | Resource modified |
| resource.deleted | Resource deleted |

### Payload Format

```json
{
  "id": "evt_abc123",
  "type": "resource.created",
  "created_at": "2024-03-15T14:30:00Z",
  "data": {
    "id": "res_abc123",
    "name": "Example"
  }
}
```

### Verification

Webhooks are signed with HMAC-SHA256. Verify the `X-Webhook-Signature` header:

```
X-Webhook-Signature: sha256=computed_hmac_of_body
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | YYYY-MM-DD | Initial release |

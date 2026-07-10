# REST API Design Guide

Opinionated conventions for designing consistent, predictable REST APIs.

---

## URL Naming

### Rules

- Use plural nouns for resources: `/users`, `/orders`, `/products`
- Use kebab-case for multi-word resources: `/order-items`, `/user-accounts`
- Use path parameters for identity: `/users/{userId}`
- Use query parameters for filtering, sorting, pagination
- Nest resources only one level deep: `/users/{userId}/orders` (not deeper)
- No verbs in URLs (the HTTP method is the verb)

### Examples

```
GET    /users                    # List users
POST   /users                    # Create user
GET    /users/{id}               # Get user
PUT    /users/{id}               # Replace user
PATCH  /users/{id}               # Partial update
DELETE /users/{id}               # Delete user

GET    /users/{id}/orders        # User's orders
POST   /users/{id}/orders        # Create order for user

# Actions (when CRUD doesn't fit)
POST   /orders/{id}/cancel       # Cancel an order
POST   /users/{id}/verify-email  # Trigger email verification
```

---

## Versioning

**Strategy: URL path versioning**

```
/api/v1/users
/api/v2/users
```

### Rules

- Major version in URL path (`v1`, `v2`)
- Minor/patch changes are backward-compatible (no version bump)
- Support N-1 version minimum (current + previous)
- Deprecation notice 6 months before removal
- Version applies to the entire API surface (not per-endpoint)

### What Requires a New Version

- Removing a field from a response
- Changing the type of a field
- Changing the meaning of a field
- Making a previously optional field required
- Removing an endpoint

### What Does NOT Require a New Version

- Adding a new optional field to request or response
- Adding a new endpoint
- Adding a new enum value (if clients handle unknown values)
- Performance improvements

---

## Pagination

**Strategy: Cursor-based (preferred) or offset-based**

### Cursor-Based (recommended for large datasets)

```json
GET /orders?limit=20&cursor=eyJpZCI6MTIzfQ

{
  "data": [...],
  "pagination": {
    "limit": 20,
    "hasMore": true,
    "nextCursor": "eyJpZCI6MTQzfQ",
    "prevCursor": "eyJpZCI6MTIzfQ"
  }
}
```

### Offset-Based (simpler, acceptable for small datasets)

```json
GET /orders?page=2&pageSize=20

{
  "data": [...],
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "totalCount": 156,
    "totalPages": 8
  }
}
```

### Rules

- Default page size: 20
- Maximum page size: 100
- Always return pagination metadata
- Cursor-based for datasets > 10k records (offset becomes slow)

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body contains invalid fields",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "value": "not-an-email"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Codes (machine-readable)

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| VALIDATION_ERROR | 400 | Request body/params invalid |
| AUTHENTICATION_REQUIRED | 401 | Missing or invalid token |
| INSUFFICIENT_PERMISSIONS | 403 | Valid auth but not authorized |
| RESOURCE_NOT_FOUND | 404 | Entity doesn't exist |
| CONFLICT | 409 | State conflict (duplicate, version mismatch) |
| RATE_LIMITED | 429 | Too many requests |
| BUSINESS_RULE_VIOLATION | 422 | Valid data but violates domain rules |
| INTERNAL_ERROR | 500 | Unexpected server error |
| SERVICE_UNAVAILABLE | 503 | Temporary outage |

### Rules

- Always include `requestId` for debugging
- Never expose stack traces in production
- Error messages are for developers (not end users)
- Include enough context to fix the problem without reading source code

---

## Authentication

### Bearer Token (JWT or opaque)

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### API Keys (for service-to-service)

```
X-API-Key: sk_live_abc123
```

### Rules

- Access tokens short-lived (15 minutes)
- Refresh tokens long-lived (7-30 days), rotated on use
- API keys scoped to minimum required permissions
- All auth over HTTPS only
- 401 for missing/invalid token; 403 for valid token without permission

---

## Status Codes

### Success

| Code | When to Use |
|------|-------------|
| 200 OK | Successful GET, PUT, PATCH, DELETE |
| 201 Created | Successful POST that created a resource |
| 202 Accepted | Request accepted for async processing |
| 204 No Content | Successful DELETE with no response body |

### Client Errors

| Code | When to Use |
|------|-------------|
| 400 Bad Request | Malformed request (invalid JSON, missing required fields) |
| 401 Unauthorized | Authentication missing or invalid |
| 403 Forbidden | Authenticated but not authorized |
| 404 Not Found | Resource doesn't exist |
| 409 Conflict | Conflict with current state (duplicate, version mismatch) |
| 422 Unprocessable Entity | Valid syntax but business rule violation |
| 429 Too Many Requests | Rate limit exceeded |

### Server Errors

| Code | When to Use |
|------|-------------|
| 500 Internal Server Error | Unexpected failure |
| 502 Bad Gateway | Upstream service failure |
| 503 Service Unavailable | Temporary outage (include Retry-After header) |
| 504 Gateway Timeout | Upstream timeout |

---

## Request/Response Conventions

### Request Bodies

```json
POST /users
{
  "email": "user@example.com",
  "displayName": "Jane Smith",
  "role": "member"
}
```

### Response Bodies

```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "displayName": "Jane Smith",
  "role": "member",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Conventions

- camelCase for JSON field names
- ISO 8601 for dates (`2024-01-15T10:30:00Z`)
- Prefixed IDs for readability (`usr_`, `ord_`, `prod_`)
- Null fields included in response (not omitted)
- Consistent field ordering (id first, timestamps last)

---

## Filtering, Sorting, and Search

### Filtering

```
GET /orders?status=confirmed&createdAfter=2024-01-01
GET /users?role=admin&status=active
```

### Sorting

```
GET /orders?sort=createdAt:desc
GET /products?sort=price:asc,name:asc
```

### Search

```
GET /products?q=wireless+headphones
```

### Rules

- Filter field names match response field names
- Multiple filters combined with AND
- Sort format: `field:direction` (asc/desc)
- Search (`q`) is full-text across relevant fields
- Document which fields are filterable/sortable

---

## Rate Limiting

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312200
Retry-After: 30
```

### Strategy

| Tier | Limit | Window | Scope |
|------|-------|--------|-------|
| Anonymous | 60 req | Per minute | Per IP |
| Authenticated | 1000 req | Per minute | Per API key |
| Premium | 5000 req | Per minute | Per API key |

---

## Idempotency

For non-idempotent operations (POST), support idempotency keys:

```
POST /payments
Idempotency-Key: idem_abc123
```

- Same key + same body = return cached response (no re-execution)
- Same key + different body = return 409 Conflict
- Keys expire after 24 hours

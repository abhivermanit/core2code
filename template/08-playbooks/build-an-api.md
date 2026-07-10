# Playbook: Build an API

An API is a contract. Once published, consumers depend on it. Design carefully, document thoroughly, version responsibly.

## Versioning

See [versioning.md](../06-delivery/versioning.md) for full details.

### Quick Rules

- URL path versioning: `/api/v1/users`
- Major version only in URL (not minor/patch)
- Maximum 2 versions live simultaneously
- 12-month deprecation window minimum
- Deprecation headers on old versions

## Authentication

### Token-Based (JWT or Opaque)

```typescript
// API key for server-to-server
app.use('/api/v1', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key required' });

  const key = await validateApiKey(apiKey);
  if (!key) return res.status(401).json({ error: 'Invalid API key' });
  if (key.expiresAt < new Date()) return res.status(401).json({ error: 'API key expired' });

  req.tenant = key.tenant;
  req.scopes = key.scopes;
  next();
});
```

### API Key Design

```sql
api_keys (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL, -- "Production backend", "CI/CD pipeline"
  key_prefix TEXT NOT NULL, -- first 8 chars (for identification without exposure)
  key_hash TEXT NOT NULL, -- bcrypt hash of full key
  scopes TEXT[], -- ['read:users', 'write:orders']
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Scopes

```
read:users     — List and view users
write:users    — Create and update users
delete:users   — Delete users
read:orders    — List and view orders
write:orders   — Create and update orders
admin          — Full access (dangerous, limit usage)
```

## Rate Limiting

### Implementation

```typescript
// Sliding window rate limiter
const rateLimiter = {
  // Per API key
  default: { requests: 100, window: '1m' },
  // Per endpoint (override for expensive operations)
  endpoints: {
    'POST /api/v1/exports': { requests: 5, window: '1h' },
    'GET /api/v1/search': { requests: 30, window: '1m' },
  },
  // Per plan
  plans: {
    free: { requests: 60, window: '1m' },
    pro: { requests: 1000, window: '1m' },
    enterprise: { requests: 10000, window: '1m' },
  },
};
```

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1710523200
Retry-After: 30  (only on 429)
```

### 429 Response

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Retry after 30 seconds.",
    "retry_after": 30
  }
}
```

## Pagination

### Cursor-Based (Recommended)

```http
GET /api/v1/users?limit=20&cursor=eyJpZCI6MTIzfQ

Response:
{
  "data": [...],
  "pagination": {
    "has_more": true,
    "next_cursor": "eyJpZCI6MTQzfQ",
    "prev_cursor": "eyJpZCI6MTAzfQ"
  }
}
```

**Why cursor over offset:**
- Consistent results when data changes during pagination
- Efficient for large datasets (no OFFSET scan)
- No "page 10000" requests that kill the database

### Offset-Based (Simple Use Cases)

```http
GET /api/v1/users?page=2&per_page=20

Response:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "per_page": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

Use offset only when total count is cheap and dataset is small.

## Error Responses

### Consistent Error Format

```json
{
  "error": {
    "code": "validation_error",
    "message": "The request body contains invalid fields.",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "invalid_format"
      },
      {
        "field": "age",
        "message": "Must be at least 13",
        "code": "too_small"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

### HTTP Status Code Usage

| Status | When | Error Code |
|--------|------|------------|
| 400 | Invalid request body/params | validation_error |
| 401 | Missing or invalid auth | unauthorized |
| 403 | Valid auth, insufficient permissions | forbidden |
| 404 | Resource doesn't exist | not_found |
| 409 | Conflict (duplicate, state mismatch) | conflict |
| 422 | Semantically invalid (valid JSON, wrong values) | unprocessable |
| 429 | Rate limited | rate_limit_exceeded |
| 500 | Server error (always log, never expose internals) | internal_error |

### Error Rules

- Every error has a machine-readable `code` and human-readable `message`
- Include `request_id` for support debugging
- Never expose stack traces, SQL errors, or internal paths
- Validation errors list ALL issues, not just the first one
- 5xx errors are generic to the consumer but detailed in internal logs

## Documentation

### Required Documentation

- **Authentication guide** — how to get and use API keys
- **Quickstart** — working example in < 5 minutes
- **Endpoint reference** — every endpoint with request/response examples
- **Error reference** — every error code with description and resolution
- **Changelog** — what changed in each version
- **Rate limit documentation** — limits per plan, headers, handling 429s
- **Webhooks** — events, payload format, retry behavior

### OpenAPI Spec

```yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0
paths:
  /api/v1/users:
    get:
      summary: List users
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
```

Generate docs from spec. Never maintain docs separately from spec.

## SDKs

### When to Build SDKs

- After API is stable (post v1.0)
- When adoption matters more than control
- Start with most-used languages (JavaScript/TypeScript, Python)

### SDK Design

```typescript
// TypeScript SDK example
const client = new MyAPI({ apiKey: 'sk_...' });

// Typed, discoverable, ergonomic
const users = await client.users.list({ limit: 20 });
const user = await client.users.get('usr_123');
const created = await client.users.create({ email: 'new@example.com', name: 'New User' });
```

### SDK Requirements

- Type-safe (TypeScript types, Python type hints)
- Auto-retry on transient failures (429, 500, network errors)
- Respect rate limit headers (back off automatically)
- Configurable timeout and base URL
- Error classes with structured access to error details
- Generated from OpenAPI spec (don't hand-code)

## Webhooks (Outbound)

### Design

```json
{
  "id": "evt_abc123",
  "type": "order.completed",
  "created_at": "2024-03-15T14:30:00Z",
  "data": {
    "id": "ord_123",
    "status": "completed",
    "total_cents": 4999
  }
}
```

### Webhook Reliability

- Sign payloads (HMAC-SHA256)
- Retry with exponential backoff (3 attempts over 24h)
- Deliver in order when possible
- Include event ID for idempotent processing
- Provide webhook logs in dashboard (delivery attempts, responses)
- Allow consumers to verify signatures

## Anti-Patterns

- **No versioning** — breaking changes surprise consumers
- **Inconsistent responses** — sometimes `data` wrapper, sometimes not
- **Pagination via offset on large datasets** — performance cliff
- **Exposing internal errors** — SQL errors, file paths in 500 responses
- **No rate limiting** — one consumer can DoS your API
- **Documentation that lies** — stale docs are worse than no docs
- **Auth in query parameters** — keys leak in logs, browser history, referrer headers
- **Synchronous everything** — long operations should return 202 and provide status endpoint

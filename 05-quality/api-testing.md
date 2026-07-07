# API Testing

## Principle

API tests verify that your endpoints behave correctly from a client's perspective: correct status codes, proper error responses, authentication enforcement, pagination behavior, and rate limit compliance.

---

## What to Test

| Category | Test Cases |
|----------|-----------|
| Status codes | 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500 |
| Success responses | Correct shape, correct data, correct headers |
| Error responses | Consistent format, helpful messages, no leaks |
| Authentication | Valid token, expired token, missing token, invalid token |
| Authorization | Own resources, others' resources, admin-only |
| Pagination | First page, last page, empty results, invalid params |
| Rate limiting | Within limits, exceeded, retry-after header |
| Input validation | Required fields, type mismatches, boundary values |
| Idempotency | Repeated requests produce same result |

---

## Status Code Testing

```typescript
describe('POST /api/orders', () => {
  it('returns 201 with created order', async () => {
    const res = await api.post('/orders').auth(userToken).send(validOrder);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 for invalid body', async () => {
    const res = await api.post('/orders').auth(userToken).send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 without authentication', async () => {
    const res = await api.post('/orders').send(validOrder);
    expect(res.status).toBe(401);
  });

  it('returns 409 for duplicate idempotency key', async () => {
    const key = 'idem-123';
    await api.post('/orders').auth(userToken).set('Idempotency-Key', key).send(validOrder);
    const res = await api.post('/orders').auth(userToken).set('Idempotency-Key', key).send(validOrder);
    expect(res.status).toBe(409);
  });
});
```

---

## Error Response Format

All error responses must follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Required" },
      { "field": "items", "message": "Must contain at least 1 item" }
    ]
  }
}
```

### Test Error Consistency

```typescript
describe('Error response format', () => {
  const errorEndpoints = [
    { method: 'post', path: '/orders', body: {}, expectedCode: 'VALIDATION_ERROR' },
    { method: 'get', path: '/orders/nonexistent', expectedCode: 'NOT_FOUND' },
    { method: 'delete', path: '/users/other-user', expectedCode: 'NOT_FOUND' },
  ];

  errorEndpoints.forEach(({ method, path, body, expectedCode }) => {
    it(`${method.toUpperCase()} ${path} returns consistent error shape`, async () => {
      const res = await api[method](path).auth(userToken).send(body);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code', expectedCode);
      expect(res.body.error).toHaveProperty('message');
      // Never expose internal details
      expect(res.body.error).not.toHaveProperty('stack');
      expect(res.body.error).not.toHaveProperty('sql');
    });
  });
});
```

---

## Authentication Testing

```typescript
describe('Authentication', () => {
  it('accepts valid bearer token', async () => {
    const res = await api.get('/me').auth(validToken);
    expect(res.status).toBe(200);
  });

  it('rejects expired token', async () => {
    const res = await api.get('/me').auth(expiredToken);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('rejects malformed token', async () => {
    const res = await api.get('/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects missing authorization header', async () => {
    const res = await api.get('/me');
    expect(res.status).toBe(401);
  });
});
```

---

## Pagination Testing

```typescript
describe('GET /api/orders (pagination)', () => {
  beforeAll(async () => {
    // Seed 25 orders
    await seedOrders(25);
  });

  it('returns first page with default page size', async () => {
    const res = await api.get('/orders').auth(userToken);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(20); // Default page size
    expect(res.body.pagination).toMatchObject({
      page: 1,
      pageSize: 20,
      total: 25,
      hasNext: true,
    });
  });

  it('returns second page', async () => {
    const res = await api.get('/orders?page=2').auth(userToken);
    expect(res.body.data.length).toBe(5);
    expect(res.body.pagination.hasNext).toBe(false);
  });

  it('returns empty array for page beyond data', async () => {
    const res = await api.get('/orders?page=100').auth(userToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('rejects invalid page size', async () => {
    const res = await api.get('/orders?pageSize=1000').auth(userToken);
    expect(res.status).toBe(400); // Max page size exceeded
  });
});
```

---

## Rate Limit Testing

```typescript
describe('Rate limiting', () => {
  it('returns rate limit headers', async () => {
    const res = await api.get('/orders').auth(userToken);
    expect(res.headers).toHaveProperty('x-ratelimit-limit');
    expect(res.headers).toHaveProperty('x-ratelimit-remaining');
    expect(res.headers).toHaveProperty('x-ratelimit-reset');
  });

  it('returns 429 when limit exceeded', async () => {
    // Exhaust rate limit
    const limit = 5;
    for (let i = 0; i < limit; i++) {
      await api.post('/auth/login').send(invalidCredentials);
    }

    const res = await api.post('/auth/login').send(invalidCredentials);
    expect(res.status).toBe(429);
    expect(res.headers).toHaveProperty('retry-after');
  });
});
```

---

## Test Organization

```
tests/
├── api/
│   ├── auth.api.test.ts       # Login, logout, register, token refresh
│   ├── users.api.test.ts      # CRUD on users
│   ├── orders.api.test.ts     # CRUD on orders
│   └── admin.api.test.ts      # Admin-only endpoints
├── helpers/
│   ├── api-client.ts          # Configured test client
│   ├── auth.helper.ts         # Token generation for tests
│   └── seed.helper.ts         # Data seeding utilities
└── setup.ts                   # Global test setup/teardown
```

---

## Anti-Patterns

- **Testing only 200 responses** — Error paths are where bugs hide.
- **Hardcoded IDs in tests** — Use created resources, not assumed data.
- **Skipping auth tests** — "It works when I test manually" isn't a test.
- **Not testing response shape** — Status 200 with wrong body is still a bug.
- **Testing against production** — Always use dedicated test environments.
- **No cleanup** — Test data left behind causes flaky tests.

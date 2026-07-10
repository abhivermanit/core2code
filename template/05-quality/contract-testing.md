# Contract Testing

## Principle

Contract tests verify that APIs meet the agreements between producers and consumers. They catch breaking changes before deployment, without requiring a full integration environment. If the contract is satisfied, the systems will work together.

---

## What is a Contract?

A contract defines:
- Request format (method, path, headers, body schema)
- Response format (status code, body schema, headers)
- Error responses for invalid requests
- Behavioral guarantees (idempotency, ordering)

---

## Consumer-Driven Contracts

The consumer (client) defines what it needs from the producer (API). The producer verifies it meets all consumers' expectations.

```
Consumer A needs: GET /users/:id → { id, name, email }
Consumer B needs: GET /users/:id → { id, name, role }

Producer must satisfy BOTH:
GET /users/:id → { id, name, email, role, ... }
```

### Workflow

```
1. Consumer writes contract (what it expects)
2. Contract is shared (Pact broker, schema registry, git)
3. Producer verifies it satisfies all contracts
4. Both deploy independently with confidence
```

---

## Schema Validation

### OpenAPI/JSON Schema Approach

```typescript
// contract/user-api.contract.ts
import { z } from 'zod';

export const GetUserContract = {
  request: {
    method: 'GET',
    path: '/api/users/:id',
    params: z.object({ id: z.string().uuid() }),
  },
  response: {
    200: z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      role: z.enum(['admin', 'member', 'viewer']),
      createdAt: z.string().datetime(),
    }),
    404: z.object({
      error: z.object({
        code: z.literal('NOT_FOUND'),
        message: z.string(),
      }),
    }),
  },
};
```

### Consumer-Side Test

```typescript
describe('UserAPI contract (consumer)', () => {
  it('GET /users/:id returns expected shape', async () => {
    // Hit the real API (or Pact mock)
    const response = await apiClient.getUser('usr-123');

    // Validate against contract
    const result = GetUserContract.response[200].safeParse(response.data);
    expect(result.success).toBe(true);
  });

  it('GET /users/:id returns 404 for unknown user', async () => {
    const response = await apiClient.getUser('usr-nonexistent');

    expect(response.status).toBe(404);
    const result = GetUserContract.response[404].safeParse(response.data);
    expect(result.success).toBe(true);
  });
});
```

### Producer-Side Test

```typescript
describe('UserAPI contract (producer)', () => {
  it('satisfies GetUser contract', async () => {
    // Seed test data
    await db.users.insert({ id: 'usr-123', name: 'Alice', email: 'a@b.com', role: 'member' });

    const response = await request(app).get('/api/users/usr-123');

    // Verify response matches all consumer contracts
    const result = GetUserContract.response[200].safeParse(response.body);
    expect(result.success).toBe(true);
  });
});
```

---

## Backward Compatibility

### Safe Changes (Non-Breaking)

- Adding new optional fields to response
- Adding new endpoints
- Adding new optional query parameters
- Relaxing validation (accepting more formats)

### Breaking Changes (Require Versioning)

- Removing a field from response
- Changing a field's type
- Renaming a field
- Making an optional field required
- Changing response status codes
- Changing error format

### Versioning Strategy

```
/api/v1/users  — Current, stable
/api/v2/users  — New version with breaking changes
```

- Support N-1 versions minimum (current + previous)
- Deprecation notice: 3 months before removal
- Version in URL path (not headers — more discoverable)

---

## Tools

| Tool | Approach | Best For |
|------|----------|----------|
| Pact | Consumer-driven contract testing | Microservices, polyglot |
| Dredd | Test against OpenAPI spec | API-first development |
| Prism | Mock server from OpenAPI spec | Frontend development |
| Schemathesis | Property-based API testing | Finding edge cases |
| zod + custom tests | Schema validation in tests | TypeScript monorepos |

---

## Contract Testing in CI

```yaml
# Producer CI pipeline
test:contracts:
  steps:
    - Fetch latest consumer contracts
    - Run producer against all contracts
    - Fail if any contract is violated
    - Publish verification results

# Consumer CI pipeline
test:contracts:
  steps:
    - Run consumer tests against contract mock
    - Publish new/updated contracts
    - Verify producer satisfies new contract (can-i-deploy check)
```

---

## When to Use Contract Testing

| Scenario | Contract Tests? |
|----------|----------------|
| Team A's frontend calls Team B's API | Yes — different deploy cycles |
| Microservice A calls Microservice B | Yes — independent deployments |
| Mobile app calls backend API | Yes — can't force update mobile clients |
| Internal function calls within a service | No — use unit/integration tests |
| Third-party API you consume | Yes — detect when they break you |

---

## Anti-Patterns

- **Testing the full behavior, not the shape** — Contracts verify structure, not business logic.
- **Consumer and producer in the same repo with same deploy** — Just use integration tests.
- **Contracts that are too strict** — Don't assert on exact values, assert on shape and types.
- **Contracts that are too loose** — `response: any` tests nothing. Validate real structure.
- **No contract versioning** — When contracts change, both sides need to know.
- **Contracts only tested manually** — Must be in CI. Automated. Every PR.

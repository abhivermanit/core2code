# Integration Testing

## Principle

Integration tests verify that components work together correctly. Unlike unit tests, they use real dependencies — real databases, real service interactions, real file systems. They catch the bugs that unit tests miss: schema mismatches, connection issues, and boundary errors.

---

## What Integration Tests Cover

| Boundary | What to Test |
|----------|-------------|
| Application → Database | Queries return expected data, migrations work, constraints enforce |
| Service → Service | HTTP calls between services, request/response contracts |
| Application → Cache | Cache hit/miss behavior, TTL, invalidation |
| Application → Queue | Messages published/consumed correctly, ordering |
| Application → File System | Read/write operations, path handling |
| API Endpoint → Response | Full request lifecycle (middleware → handler → response) |

---

## Test Database

### Setup

- Use the same database engine as production (PostgreSQL, not SQLite)
- Dedicated test database (separate from development)
- Run migrations before test suite
- Use transactions or truncation for test isolation

```typescript
// test/setup.ts
import { migrate } from '../src/db/migrate';
import { db } from '../src/db/client';

beforeAll(async () => {
  await migrate('test'); // Run all migrations
});

beforeEach(async () => {
  // Option 1: Transaction rollback (fastest)
  await db.query('BEGIN');
});

afterEach(async () => {
  await db.query('ROLLBACK');
});

afterAll(async () => {
  await db.close();
});
```

### Strategies for Isolation

| Strategy | Speed | Isolation | Best For |
|----------|-------|-----------|----------|
| Transaction rollback | Fast | Per-test | Most tests |
| Truncate tables | Medium | Per-test | Tests that need committed data |
| Fresh database per suite | Slow | Per-suite | Complex multi-step flows |
| Docker container per run | Slowest | Per-run | CI environments |

---

## Component Interaction Tests

Test that services communicate correctly through their interfaces.

```typescript
describe('OrderService → PaymentService integration', () => {
  it('processes payment and updates order status', async () => {
    // Arrange — use real services with test database
    const order = await orderService.create({
      userId: testUser.id,
      items: [{ productId: 'prod-1', quantity: 1, price: 2999 }],
    });

    // Act
    await paymentService.processOrder(order.id, {
      paymentMethodId: 'pm_test_visa',
    });

    // Assert — verify state in database
    const updated = await orderRepository.findById(order.id);
    expect(updated.status).toBe('paid');
    expect(updated.paymentId).toBeDefined();
  });

  it('rolls back order status when payment fails', async () => {
    const order = await orderService.create({ ... });

    await expect(
      paymentService.processOrder(order.id, {
        paymentMethodId: 'pm_test_declined',
      })
    ).rejects.toThrow(PaymentDeclinedError);

    const updated = await orderRepository.findById(order.id);
    expect(updated.status).toBe('pending'); // Not stuck in limbo
  });
});
```

---

## API Endpoint Tests

Test the full HTTP request lifecycle.

```typescript
import { createApp } from '../src/app';
import request from 'supertest';

describe('POST /api/orders', () => {
  const app = createApp();

  it('creates an order and returns 201', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        items: [{ productId: 'prod-1', quantity: 2 }],
        shippingAddressId: 'addr-1',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      status: 'pending',
      items: expect.arrayContaining([
        expect.objectContaining({ productId: 'prod-1', quantity: 2 }),
      ]),
    });

    // Verify side effects
    const saved = await db.orders.findById(response.body.id);
    expect(saved).toBeDefined();
  });

  it('returns 400 for invalid request body', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ items: [] }); // Empty items

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 without authentication', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

    expect(response.status).toBe(401);
  });
});
```

---

## Boundary Testing

Test at the edges where systems meet:

| Boundary | Test Scenarios |
|----------|---------------|
| DB constraints | Unique violation, foreign key violation, check constraints |
| Timeouts | Service takes too long → timeout handling works |
| Connection failure | DB/cache down → graceful error, not crash |
| Concurrent access | Two requests modify same resource → conflict handled |
| Data limits | Very large payload, many items, maximum field lengths |

```typescript
it('handles concurrent updates with optimistic locking', async () => {
  const order = await createOrder();

  // Simulate concurrent updates
  const [result1, result2] = await Promise.allSettled([
    orderService.update(order.id, { status: 'shipped' }, { version: order.version }),
    orderService.update(order.id, { status: 'cancelled' }, { version: order.version }),
  ]);

  // One succeeds, one fails with conflict
  const fulfilled = [result1, result2].filter(r => r.status === 'fulfilled');
  const rejected = [result1, result2].filter(r => r.status === 'rejected');
  expect(fulfilled.length).toBe(1);
  expect(rejected.length).toBe(1);
});
```

---

## External Service Mocking

For integration tests involving external APIs you don't own (Stripe, SendGrid, etc.), use contract-based mocks:

```typescript
import nock from 'nock';

describe('PaymentService → Stripe', () => {
  afterEach(() => nock.cleanAll());

  it('creates a charge and returns payment ID', async () => {
    nock('https://api.stripe.com')
      .post('/v1/charges')
      .reply(200, {
        id: 'ch_test_123',
        status: 'succeeded',
        amount: 2999,
      });

    const result = await paymentService.charge({
      amount: 2999,
      currency: 'usd',
      source: 'tok_visa',
    });

    expect(result.paymentId).toBe('ch_test_123');
  });
});
```

---

## Performance Considerations

- Integration tests are slower than unit tests — accept this, but don't let them get glacial
- Use parallel test execution where tests don't share state
- Database cleanup strategy matters (transactions > truncation > recreation)
- Consider running integration tests in a separate CI step
- Target: individual integration test < 5 seconds, full suite < 5 minutes

---

## Anti-Patterns

- **Mocking the database in integration tests** — That's a unit test. Use a real DB.
- **Shared test data across test files** — One test's setup shouldn't affect another.
- **No cleanup between tests** — Leftover data causes flaky tests.
- **Testing external APIs without mocks** — Tests become flaky, slow, and expensive.
- **Skipping integration tests in CI** — If they don't run on every PR, they'll rot.
- **Integration tests that test a single function** — That's a unit test. Test the interaction.

# Unit Testing

## Principle

Unit tests verify that individual functions and classes behave correctly in isolation. They're the fastest feedback loop: write them first, run them often, trust their results.

---

## Standards

### Isolation

- No network calls (HTTP, database, file system)
- No shared state between tests
- Each test creates its own data
- External dependencies are mocked/stubbed at the boundary
- Tests run in any order and produce the same results

### Naming

Tests should read as specifications. Use descriptive names that state the behavior being verified.

```typescript
// BAD
it('test1', () => { ... });
it('should work', () => { ... });
it('createUser', () => { ... });

// GOOD
it('returns validation error when email is missing', () => { ... });
it('calculates tax based on shipping address state', () => { ... });
it('retries up to 3 times on transient failure', () => { ... });
```

**Pattern:** `it('<action> when <condition>')`

### Describe Blocks

Group by function/method, then by scenario:

```typescript
describe('OrderService.calculateTotal', () => {
  describe('when cart has items', () => {
    it('sums item prices multiplied by quantity', () => { ... });
    it('applies percentage discount to subtotal', () => { ... });
    it('adds tax based on shipping state', () => { ... });
  });

  describe('when cart is empty', () => {
    it('returns zero total', () => { ... });
  });

  describe('when discount exceeds subtotal', () => {
    it('returns zero, not negative', () => { ... });
  });
});
```

---

## AAA Pattern (Arrange, Act, Assert)

Every test follows three distinct phases:

```typescript
it('applies 10% discount when coupon is valid', () => {
  // Arrange — set up inputs and expected state
  const items = [{ productId: 'p1', price: 1000, quantity: 2 }];
  const coupon = { code: 'SAVE10', discountPercent: 10 };

  // Act — execute the behavior under test
  const total = calculateTotal(items, coupon);

  // Assert — verify the outcome
  expect(total).toBe(1800); // 2000 - 10% = 1800
});
```

### Rules

- Clear visual separation between Arrange/Act/Assert
- One Act per test (one function call being tested)
- Assert on the result, not on how it was computed
- If Arrange is complex, extract to a factory/builder

---

## One Assertion Per Test

Each test should have one logical assertion (one reason to fail). Multiple `expect` calls are fine if they verify one behavior.

```typescript
// GOOD — one logical assertion (the returned user object)
it('creates a user with default role', () => {
  const user = createUser({ name: 'Alice', email: 'a@b.com' });

  expect(user).toEqual({
    id: expect.any(String),
    name: 'Alice',
    email: 'a@b.com',
    role: 'member',
    createdAt: expect.any(Date),
  });
});

// BAD — testing multiple unrelated behaviors
it('creates a user', () => {
  const user = createUser({ name: 'Alice', email: 'a@b.com' });
  expect(user.role).toBe('member');          // Behavior 1
  expect(sendEmail).toHaveBeenCalled();      // Behavior 2
  expect(auditLog).toHaveBeenCalled();       // Behavior 3
});
```

---

## No Network Calls

Unit tests must not depend on external systems.

```typescript
// BAD — hits actual database
it('finds user by email', async () => {
  const user = await userRepository.findByEmail('alice@example.com');
  expect(user).toBeDefined();
});

// GOOD — mock the boundary
it('finds user by email', async () => {
  const mockDb = { findOne: vi.fn().mockResolvedValue({ id: '1', email: 'alice@example.com' }) };
  const repo = new UserRepository(mockDb);

  const user = await repo.findByEmail('alice@example.com');

  expect(user.email).toBe('alice@example.com');
  expect(mockDb.findOne).toHaveBeenCalledWith({ email: 'alice@example.com' });
});
```

### What to Mock

| Mock | Don't Mock |
|------|-----------|
| Database clients | The function being tested |
| HTTP clients | Pure utility functions |
| File system | Data transformations |
| External APIs | Business logic |
| Clock/Date (when time-dependent) | Value objects |

---

## Test Data

### Use Factories

```typescript
// test/factories/user.factory.ts
function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    role: 'member',
    createdAt: new Date(),
    ...overrides,
  };
}

// Usage
const admin = buildUser({ role: 'admin' });
const newUser = buildUser({ createdAt: new Date('2024-01-01') });
```

### Rules

- Don't use production data in tests
- Make test data minimal (only what's needed for the test)
- Use factories for complex objects
- Each test creates its own data (no shared fixtures that multiple tests mutate)

---

## What to Test

| Test | Examples |
|------|----------|
| Happy path | Valid input → expected output |
| Edge cases | Empty arrays, zero values, max values |
| Boundary conditions | Off-by-one, threshold values |
| Error conditions | Invalid input, missing data, exceptions |
| State transitions | Before/after for stateful operations |
| Null/undefined handling | Missing optional fields |

---

## Anti-Patterns

- **Testing private methods directly** — Test through the public API.
- **Snapshot tests for logic** — Snapshots are for UI rendering, not business logic.
- **beforeEach that does too much** — Keep setup minimal and in the test itself.
- **Testing the mock** — If you're asserting that a mock returns what you told it to, you're testing nothing.
- **Brittle assertions on implementation** — `expect(fn).toHaveBeenCalledTimes(3)` is fragile. Test the outcome.
- **Commented-out tests** — Delete them. Git has history.
- **Test file with 1000+ lines** — Split by behavior group into separate files.

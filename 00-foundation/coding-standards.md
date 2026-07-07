# Coding Standards

Consistent code is maintainable code. These standards apply across the codebase regardless of language, with language-specific addenda where necessary.

---

## Naming Conventions

### General Rules

- Names should reveal intent. If you need a comment to explain a variable name, rename the variable.
- Avoid abbreviations unless they're universally understood (`id`, `url`, `http` are fine; `usr`, `mgr`, `ctx` are not).
- Boolean variables and functions start with `is`, `has`, `can`, `should`, or `will`.
- Collections are pluralized: `users`, `orderItems`, `activeConnections`.

### Specific Conventions

| Element | Style | Example |
|---------|-------|---------|
| Variables & functions | camelCase | `getUserById`, `isValid` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT_MS` |
| Classes & types | PascalCase | `UserRepository`, `OrderStatus` |
| Files (modules) | kebab-case | `user-repository.ts`, `order-status.ts` |
| Database tables | snake_case, plural | `user_accounts`, `order_items` |
| Database columns | snake_case | `created_at`, `is_active` |
| Environment variables | UPPER_SNAKE_CASE | `DATABASE_URL`, `API_KEY` |
| URL paths | kebab-case | `/api/user-accounts`, `/order-items` |

### Function Naming

- Use verbs for actions: `create`, `update`, `delete`, `validate`, `send`, `process`
- Use nouns for retrievals: `getUser`, `findOrders`, `listConnections`
- Event handlers: `onSubmit`, `handleClick`, `afterSave`
- Predicates: `isExpired`, `hasPermission`, `canExecute`

---

## File Structure

### Project Layout

```
src/
├── config/          # Configuration loading and validation
├── domain/          # Business logic, entities, value objects
├── infrastructure/  # Database, external services, messaging
├── interfaces/      # HTTP handlers, CLI, event consumers
├── shared/          # Truly shared utilities (use sparingly)
└── index.ts         # Entry point, composition root
```

### File Organization (within a single file)

```
1. Imports (external, then internal, then relative)
2. Types and interfaces
3. Constants
4. Main export (class, function, or component)
5. Helper functions (private/unexported)
```

### File Size

- Target: under 200 lines
- Warning: over 300 lines
- Hard limit: over 500 lines — split the file

One file should have one primary responsibility. If you find yourself adding "and" to describe what a file does, split it.

---

## Error Handling

### Rules

1. **Never swallow errors silently.** Every catch block must log, rethrow, or explicitly handle.
2. **Use typed errors.** Create domain-specific error classes that carry context.
3. **Fail at the boundary.** Validate inputs at entry points; trust data within the system.
4. **Include context.** Error messages should contain what happened, what was expected, and what to do.

### Patterns

```typescript
// Good: Typed error with context
class OrderNotFoundError extends DomainError {
  constructor(orderId: string) {
    super(`Order ${orderId} not found`, { orderId });
  }
}

// Good: Explicit handling at boundaries
function parseUserInput(raw: unknown): Result<UserInput, ValidationError> {
  // validate and return structured result
}

// Bad: Silent swallow
try {
  await sendEmail(user);
} catch (e) {
  // TODO: handle this later
}

// Bad: Generic errors without context
throw new Error("Something went wrong");
```

### Error Classification

| Type | Use Case | Response |
|------|----------|----------|
| Validation errors | Bad input | 400, return details to caller |
| Not found | Missing resource | 404, log at debug level |
| Authorization | Insufficient permissions | 403, log at warn level |
| Infrastructure | DB down, timeout | 500, log at error, alert |
| Business logic | Domain rule violated | 422, return explanation |

---

## Imports

### Order

1. Standard library / runtime imports
2. External dependencies (alphabetical)
3. Internal packages (alphabetical)
4. Relative imports (alphabetical)

Separate each group with a blank line.

### Rules

- No wildcard imports (`import * as`) except for namespace patterns
- No circular imports (enforce with linting)
- Import only what you use
- Prefer named exports over default exports

```typescript
// Standard library
import { readFile } from 'node:fs/promises';

// External
import { z } from 'zod';

// Internal packages
import { Logger } from '@company/logger';
import { UserRepository } from '@company/repositories';

// Relative
import { validateInput } from './validation';
import { UserMapper } from './user-mapper';
```

---

## Comments

### When to Comment

- **Why**, never **what**. The code tells you what it does. Comments explain why it does it that way.
- Business rules that aren't obvious from context
- Workarounds with links to issues/tickets
- Public API documentation (JSDoc, docstrings)

### When Not to Comment

- Restating what the code does
- Commented-out code (delete it; git remembers)
- TODO without a ticket number
- Obvious type information

### Format

```typescript
// Good: Explains a non-obvious business decision
// Orders older than 30 days cannot be cancelled per merchant agreement §4.2
if (daysSinceOrder > 30) {
  throw new CancellationWindowExpiredError(order.id);
}

// Good: Documents workaround
// HACK(JIRA-1234): Stripe webhook delivers duplicate events under load.
// Deduplicate by idempotency key until they fix their end.
if (await isDuplicateEvent(event.idempotencyKey)) {
  return;
}

// Bad: Restates the code
// Increment counter by 1
counter += 1;
```

---

## Function Length and Complexity

### Guidelines

- **Target:** Under 20 lines of logic (excluding type definitions and setup)
- **Maximum:** 40 lines — beyond this, extract helper functions
- **Cyclomatic complexity:** Maximum 10 (prefer under 5)
- **Parameters:** Maximum 3. Beyond that, use an options/config object.
- **Nesting depth:** Maximum 3 levels. Use early returns to flatten.

### Refactoring Signals

Extract a function when:
- You can give the extracted code a meaningful name
- The same logic appears in 2+ places
- A block has a different abstraction level than its surroundings
- You need to add a comment to explain a section

```typescript
// Before: Deeply nested, hard to follow
function processOrder(order: Order) {
  if (order.status === 'pending') {
    if (order.items.length > 0) {
      if (order.payment.verified) {
        // ... 20 lines of logic
      }
    }
  }
}

// After: Flat, readable, each function testable independently
function processOrder(order: Order) {
  if (!isEligibleForProcessing(order)) {
    return;
  }
  const charges = calculateCharges(order.items);
  await executePayment(order.payment, charges);
  await fulfillOrder(order);
}
```

---

## General Rules

- No magic numbers — use named constants
- No mutable global state
- Prefer immutability (use `const`, `readonly`, frozen objects)
- Prefer pure functions where possible
- One assertion per test (conceptually, not literally)
- Delete dead code — don't comment it out
- Format with automated tools — never argue about formatting manually

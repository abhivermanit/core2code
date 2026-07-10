# Naming Conventions

## Principle

Names are the most-read documentation in your codebase. A good name eliminates the need for a comment. Be precise, be consistent, be boring.

---

## General Rules

1. **Reveal intent** — `getUserById` not `getData`
2. **Be specific** — `emailValidationError` not `err`
3. **Be consistent** — Pick one pattern per context and stick to it
4. **Avoid abbreviations** — `configuration` not `cfg`, `repository` not `repo` (exception: universally understood like `id`, `url`, `api`)
5. **Don't encode type in name** — `users` not `userArray`, `isActive` not `isActiveBool`
6. **Searchable names** — `MAX_RETRY_ATTEMPTS` not `3`

---

## Files and Directories

| Context | Convention | Example |
|---------|-----------|---------|
| Components (React/Vue) | PascalCase | `UserProfile.tsx` |
| Utilities/modules | kebab-case | `date-utils.ts`, `api-client.ts` |
| Test files | Same name + `.test` | `user-service.test.ts` |
| Config files | kebab-case | `eslint.config.js` |
| Constants files | kebab-case | `error-codes.ts` |
| Types/interfaces | kebab-case file, PascalCase export | `user-types.ts` → `export type User` |
| Directories | kebab-case, plural for collections | `components/`, `hooks/`, `utils/` |

---

## Variables

| Context | Convention | Example |
|---------|-----------|---------|
| Local variables | camelCase | `userName`, `totalAmount` |
| Boolean variables | `is`/`has`/`can`/`should` prefix | `isActive`, `hasPermission`, `canEdit` |
| Arrays/collections | Plural nouns | `users`, `orderItems`, `activeConnections` |
| Single items | Singular nouns | `user`, `orderItem`, `connection` |
| Counts | `count` suffix or `num` prefix | `retryCount`, `numAttempts` |
| Nullable | No special encoding, use types | `user: User | null` |

---

## Functions and Methods

| Context | Convention | Example |
|---------|-----------|---------|
| General functions | camelCase, verb + noun | `createUser`, `validateEmail` |
| Getters | `get` prefix | `getUserById`, `getActiveOrders` |
| Setters | `set` prefix | `setUserName`, `setTheme` |
| Boolean returns | `is`/`has`/`can`/`should` | `isValid()`, `hasAccess()` |
| Event handlers | `handle` or `on` prefix | `handleClick`, `onSubmit` |
| Async operations | Verb describing the action | `fetchUsers`, `saveOrder` (not `getUsersAsync`) |
| Factory functions | `create` prefix | `createLogger`, `createConnection` |
| Transformers | `to` prefix or `from` prefix | `toJSON`, `fromDTO` |
| Validators | `validate` or `check` prefix | `validateInput`, `checkPermissions` |

---

## Classes and Types

| Context | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase, noun | `UserRepository`, `OrderService` |
| Interfaces | PascalCase, no `I` prefix | `UserRepository`, not `IUserRepository` |
| Type aliases | PascalCase | `CreateUserInput`, `OrderStatus` |
| Enums | PascalCase name, PascalCase members | `OrderStatus.Pending` |
| Generics | Single uppercase or descriptive | `T`, `TInput`, `TResponse` |
| Abstract classes | `Base` or `Abstract` prefix | `BaseRepository`, `AbstractHandler` |
| Error classes | `Error` suffix | `ValidationError`, `NotFoundError` |

---

## Constants

| Context | Convention | Example |
|---------|-----------|---------|
| Module-level constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`, `DEFAULT_TIMEOUT_MS` |
| Enum-like objects | PascalCase key, UPPER_SNAKE values | `HttpStatus.OK`, `HttpStatus.NOT_FOUND` |
| Environment variables | UPPER_SNAKE_CASE, prefixed | `APP_DATABASE_URL`, `APP_JWT_SECRET` |
| Feature flags | UPPER_SNAKE with `FF_` prefix | `FF_NEW_CHECKOUT_FLOW` |
| Config objects | camelCase properties | `{ maxRetries: 3, timeoutMs: 5000 }` |

---

## Database

| Context | Convention | Example |
|---------|-----------|---------|
| Tables | snake_case, plural | `users`, `order_items`, `audit_logs` |
| Columns | snake_case | `first_name`, `created_at`, `is_active` |
| Primary keys | `id` | `users.id` |
| Foreign keys | singular table + `_id` | `user_id`, `order_id` |
| Indexes | `idx_<table>_<columns>` | `idx_users_email`, `idx_orders_status_created` |
| Constraints | `<type>_<table>_<column>` | `uq_users_email`, `chk_orders_total_positive` |
| Timestamps | `created_at`, `updated_at`, `deleted_at` | Consistent across all tables |
| Boolean columns | `is_` prefix | `is_active`, `is_verified` |
| Junction tables | `<table1>_<table2>` alphabetical | `projects_users`, `orders_tags` |

---

## APIs

| Context | Convention | Example |
|---------|-----------|---------|
| Endpoints | kebab-case, plural nouns | `/api/v1/order-items` |
| Path parameters | camelCase | `/users/:userId` |
| Query parameters | camelCase | `?pageSize=20&sortBy=createdAt` |
| Request body fields | camelCase | `{ "firstName": "Alice" }` |
| Response fields | camelCase | `{ "orderId": "abc-123" }` |
| Headers (custom) | `X-` prefix (or standard names) | `X-Request-Id`, `X-Correlation-Id` |
| Versions | Path prefix | `/api/v1/`, `/api/v2/` |

---

## Branches

See `branching.md` for full details.

```
<type>/<ticket-id>-<short-description>
feat/PROJ-123-oauth-google-login
fix/PROJ-456-duplicate-charge
```

---

## What to Avoid

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| `data`, `info`, `item`, `thing` | Meaningless | Name what it actually is |
| `tmp`, `temp`, `foo`, `bar` | Placeholder left in code | Give it a real name |
| `handle`, `process`, `manage` alone | Too vague | `handlePaymentFailure`, `processRefund` |
| `utils` as a function name | What utility? | `formatCurrency`, `parseDate` |
| `doStuff`, `execute`, `run` | Explains nothing | Verb + specific noun |
| Hungarian notation (`strName`, `iCount`) | Redundant with types | Let the type system handle it |
| Negated booleans (`isNotActive`) | Cognitive overhead | `isActive` with inverse logic |

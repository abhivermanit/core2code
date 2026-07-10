# Error Handling

## Principle

Errors are not exceptional — they're expected. Design for failure. Every error should be categorized, communicated clearly, and handled at the right level.

---

## Core Rules

1. **Never swallow errors.** Every `catch` must log, re-throw, or return a meaningful error.
2. **Fail fast.** Validate inputs early. Don't let bad data propagate.
3. **Errors are typed.** Use custom error classes, not generic `Error` or string messages.
4. **User-facing errors are separate from internal errors.** Never leak stack traces or internal details.
5. **Log errors with context.** What operation? What input? What state?

---

## Typed Errors

Define a base error class and extend for each error category.

```typescript
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly fields: Record<string, string>,
    cause?: Error
  ) {
    super(message, cause);
  }
}

class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
  readonly isOperational = true;
}

class ConflictError extends AppError {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;
  readonly isOperational = true;
}

class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 502;
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly service: string,
    cause?: Error
  ) {
    super(message, cause);
  }
}
```

---

## Error Codes

Every error gets a machine-readable code. Human-readable messages change; codes don't.

```typescript
const ErrorCodes = {
  // Auth
  AUTH_INVALID_CREDENTIALS: 'auth/invalid-credentials',
  AUTH_TOKEN_EXPIRED: 'auth/token-expired',
  AUTH_INSUFFICIENT_PERMISSIONS: 'auth/insufficient-permissions',

  // Billing
  BILLING_CARD_DECLINED: 'billing/card-declined',
  BILLING_INSUFFICIENT_FUNDS: 'billing/insufficient-funds',

  // Validation
  VALIDATION_REQUIRED_FIELD: 'validation/required-field',
  VALIDATION_INVALID_FORMAT: 'validation/invalid-format',
} as const;
```

---

## User-Facing vs Internal Errors

| Aspect | User-Facing | Internal |
|--------|-------------|----------|
| Message | "Unable to process payment" | "Stripe API returned 500 on charge attempt" |
| Details | What the user can do about it | Stack trace, request context, service state |
| Codes | `billing/card-declined` | Full error chain with cause |
| Where | API response body | Server logs only |

```typescript
// Error handler middleware
function errorHandler(err: Error, req: Request, res: Response) {
  if (err instanceof AppError && err.isOperational) {
    // Expected error — return safe details to client
    logger.warn('Operational error', { code: err.code, message: err.message });
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  // Unexpected error — log everything, return generic message
  logger.error('Unexpected error', { error: err, requestId: req.id });
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}
```

---

## Error Boundaries

Catch errors at defined boundaries. Don't let them propagate uncontrolled.

| Boundary | Responsibility |
|----------|---------------|
| Request handler (controller) | Catch service errors, map to HTTP response |
| Service layer | Catch repository/external errors, throw domain errors |
| Background job processor | Catch all, log, decide retry vs dead-letter |
| UI component (React) | Error boundary component, show fallback UI |
| Event handler | Catch, log, acknowledge message (prevent redelivery loops) |

---

## Retry Logic

Not all errors are retryable. Classify before retrying.

| Error Type | Retryable | Strategy |
|-----------|-----------|----------|
| Network timeout | Yes | Exponential backoff |
| 5xx from external service | Yes | Backoff with jitter |
| 429 Rate limited | Yes | Respect `Retry-After` header |
| 4xx Client error | No | Fix the request |
| Validation error | No | Fix the input |
| Auth error | No | Re-authenticate |
| Database constraint violation | No | Fix the data |

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts: number; baseDelayMs: number }
): Promise<T> {
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!isRetryable(error) || attempt === options.maxAttempts) {
        throw error;
      }
      const delay = options.baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * delay * 0.1;
      await sleep(delay + jitter);
    }
  }
  throw new Error('Unreachable');
}
```

---

## Anti-Patterns

```typescript
// BAD: Swallowing errors
try { await saveUser(data); } catch (e) { /* ignore */ }

// BAD: Generic catch-all that hides the problem
try { ... } catch (e) { return null; }

// BAD: Throwing strings
throw 'Something went wrong';

// BAD: Logging without context
catch (e) { logger.error(e.message); }

// BAD: Exposing internals to users
res.status(500).json({ error: err.stack });

// GOOD: Typed error with context
throw new ExternalServiceError(
  'Payment processing failed',
  'stripe',
  originalError
);
```

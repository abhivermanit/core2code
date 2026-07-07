# Logging Standards

## Principle

Logs are your production debugger. They must be structured, searchable, and safe. If you can't diagnose an incident from logs alone, your logging is insufficient.

---

## Structured Logging Format

All logs are JSON. No free-form strings in production.

```json
{
  "timestamp": "2024-01-15T10:23:45.123Z",
  "level": "error",
  "message": "Payment processing failed",
  "service": "billing-api",
  "correlationId": "req-abc-123",
  "userId": "usr_456",
  "error": {
    "code": "PAYMENT_DECLINED",
    "message": "Card declined by issuer",
    "stack": "..."
  },
  "metadata": {
    "orderId": "ord_789",
    "amount": 4999,
    "currency": "USD",
    "retryAttempt": 2
  }
}
```

---

## Log Levels

| Level | Use When | Example |
|-------|----------|---------|
| `fatal` | Application cannot continue | Database connection pool exhausted |
| `error` | Operation failed, needs attention | Payment charge failed after retries |
| `warn` | Unexpected but handled | Rate limit approaching threshold |
| `info` | Significant business events | User signed up, order placed |
| `debug` | Developer troubleshooting | Cache hit/miss, query parameters |
| `trace` | Granular internal flow | Function entry/exit, loop iterations |

### Level Rules

- **Production default:** `info` and above
- **Staging:** `debug` and above
- **Local development:** `trace` and above
- **Never:** Change log levels via code deploy. Use runtime config (env var or feature flag).

---

## What to Log

### Always Log

- Authentication events (login, logout, failed attempts)
- Authorization failures (access denied)
- API requests (method, path, status code, duration)
- Business events (order created, payment processed, user action)
- Error details with context (what failed, what was the input)
- External service calls (target, duration, success/failure)
- Startup and shutdown events
- Configuration loaded (keys, not values)

### Log Conditionally (debug/trace)

- Cache operations (hit/miss/eviction)
- Database queries (parameterized, not with values)
- Internal function calls in complex flows
- Queue message processing

---

## What NEVER to Log

| Category | Examples | Risk |
|----------|----------|------|
| Secrets | API keys, tokens, passwords, private keys | Credential exposure |
| PII | Email, phone, SSN, address, IP (in some jurisdictions) | Privacy/GDPR violation |
| Payment data | Card numbers, CVV, bank accounts | PCI-DSS violation |
| Health data | Medical records, diagnoses | HIPAA violation |
| Full request bodies | May contain any of the above | Data leak |
| Session tokens | JWTs, session IDs in full | Session hijacking |

**Instead:** Log identifiers (`userId`, `orderId`), not the data itself. Mask or redact sensitive fields.

```typescript
// BAD
logger.info('User login', { email: user.email, password: input.password });

// GOOD
logger.info('User login successful', { userId: user.id });
```

---

## Correlation IDs

Every request gets a unique correlation ID that flows through all services.

```typescript
// Middleware: assign or propagate correlation ID
function correlationMiddleware(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}

// Attach to every log entry automatically
const logger = createLogger({
  defaultMeta: () => ({
    correlationId: getCorrelationId(), // from async local storage
  }),
});
```

### Rules

- Generate at the edge (API gateway or first service)
- Propagate in headers (`X-Correlation-Id`) to downstream services
- Include in all log entries for that request
- Return in response headers for client-side debugging

---

## Implementation

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: ['req.headers.authorization', 'req.body.password', '*.token'],
    censor: '[REDACTED]',
  },
});
```

---

## Anti-Patterns

- `console.log` in production — Use a structured logger.
- Logging inside tight loops — Creates noise, hurts performance.
- `catch (e) { logger.error(e) }` without context — What operation failed? What was the input?
- Logging success for every trivial operation — Info-level for business events only.
- String concatenation in log messages — Use structured fields.
- Logging the entire request/response body — Mask sensitive data, log only what's needed.

# Production Logging

Logs are your forensic record. When something goes wrong at 3 AM, logs are how you figure out what happened.

## Structured Logging

**Always use structured (JSON) logging in production.** Plain text is for humans at a terminal, not for machines parsing millions of lines.

```json
{
  "timestamp": "2024-03-15T14:30:00.123Z",
  "level": "error",
  "message": "Payment processing failed",
  "service": "checkout-api",
  "traceId": "abc123def456",
  "spanId": "span789",
  "userId": "usr_12345",
  "orderId": "ord_67890",
  "error": {
    "type": "PaymentDeclined",
    "message": "Insufficient funds",
    "code": "card_declined"
  },
  "duration_ms": 1523,
  "environment": "production"
}
```

### Required Fields (Every Log Entry)

| Field | Purpose |
|-------|---------|
| timestamp | When (ISO 8601, UTC) |
| level | Severity |
| message | What happened (human-readable) |
| service | Which service |
| traceId | Correlation across services |

### Contextual Fields (When Available)

| Field | Purpose |
|-------|---------|
| userId | Who was affected |
| requestId | Which request |
| spanId | Which operation in the trace |
| duration_ms | How long it took |
| error.type | Error classification |
| environment | Which environment |

## Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| ERROR | Something broke, needs attention | Payment failed, DB connection lost |
| WARN | Something unexpected, not broken yet | Retry succeeded, approaching limit |
| INFO | Normal operations worth recording | Request served, job completed |
| DEBUG | Detailed troubleshooting info | Query parameters, intermediate state |

### Level Rules

- **ERROR** triggers alerts. If it doesn't need an alert, it's not an error.
- **WARN** is reviewed daily. Accumulating warns indicate emerging issues.
- **INFO** is the default production level. Enough to understand flow without noise.
- **DEBUG** is off in production by default. Enable per-service when investigating.

### Production Level Configuration

```
Production: INFO (DEBUG on-demand per service)
Staging: DEBUG
Development: DEBUG
```

## What to Log

### Always Log

- Request received (method, path, user, start time)
- Request completed (status, duration, response size)
- Authentication events (login, logout, failure)
- Authorization failures (who tried to access what)
- External service calls (to where, duration, success/failure)
- Background job start/complete/failure
- Error with full context (not just the message)

### Never Log

- Passwords, tokens, API keys, secrets
- Full credit card numbers (last 4 only)
- Health check requests (noise, pollutes logs)
- Personally identifiable information without justification
- Request/response bodies in production (too verbose, privacy risk)

## Retention Policy

| Log Type | Retention | Reason |
|----------|-----------|--------|
| Application logs | 30 days hot, 90 days cold | Troubleshooting window |
| Security/audit logs | 1 year minimum | Compliance, forensics |
| Access logs | 90 days | Debugging, analytics |
| Debug logs | 7 days | Short-term investigation |

### Cost Management

- Compress older logs (gzip reduces 90%)
- Move to cold storage after hot period
- Sample verbose logs if volume is too high (keep 10% of DEBUG)
- Set log level per service, not globally

## Aggregation and Search

### Requirements

- Centralized log aggregation (all services in one place)
- Full-text search across all logs
- Filter by service, level, time range, trace ID
- Tail logs in real-time for live debugging
- Alert on log patterns (error spikes, specific messages)

### Tools

| Tool | Best For |
|------|----------|
| Datadog Logs | Enterprise, integrated with APM |
| Grafana Loki | Cost-effective, Prometheus-like labels |
| Elastic/OpenSearch | Full-text search, self-hosted |
| CloudWatch Logs | AWS native, simple |
| Better Stack | Developer-friendly, good search |

## Implementation Pattern

```typescript
import { logger } from './logger';

// Good: structured context
logger.info('Order created', {
  orderId: order.id,
  userId: user.id,
  total: order.total,
  items: order.items.length,
});

// Good: error with context
logger.error('Payment failed', {
  orderId: order.id,
  error: err.message,
  errorType: err.constructor.name,
  provider: 'stripe',
  duration_ms: Date.now() - startTime,
});

// Bad: unstructured string interpolation
logger.info(`Order ${orderId} created by user ${userId} for $${total}`);

// Bad: logging sensitive data
logger.info('User login', { email, password, token });
```

## Correlation

Every request gets a trace ID at the edge. Propagate it through all service calls.

```
Browser → API Gateway (generates traceId: abc123)
  → Auth Service (traceId: abc123)
  → Order Service (traceId: abc123)
    → Payment Service (traceId: abc123)
    → Notification Service (traceId: abc123)
```

When investigating an issue, filter all logs by traceId to see the full story.

## Anti-Patterns

- **Logging without structure** — grep through millions of text lines is not a strategy
- **Logging everything** — noise hides signal, costs money
- **Logging nothing** — "I don't know what happened" is not acceptable in production
- **Logging secrets** — one leaked token in logs = security incident
- **No correlation IDs** — can't trace a request across services
- **Different formats per service** — aggregation becomes impossible
- **Logs as the only monitoring** — logs are reactive. Use metrics for proactive alerting.

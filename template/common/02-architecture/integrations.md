# Third-Party Integration Patterns

Every external integration is a potential failure point. Design for the reality that third-party services will be slow, return unexpected data, rate-limit you, change their API, and go down entirely.

---

## Integration Principles

1. **Never trust external data** — validate everything at the boundary
2. **Abstract behind interfaces** — swap providers without changing business logic
3. **Design for failure** — every call can fail; have a plan
4. **Observe everything** — log, metric, trace every external call
5. **Limit blast radius** — one integration failure shouldn't take down your system

---

## API Client Pattern

### Structure

```typescript
// Interface (domain layer) — no dependency on specific provider
interface PaymentGateway {
  charge(amount: Money, method: PaymentMethod): Promise<Result<ChargeResult, PaymentError>>;
  refund(chargeId: string, amount: Money): Promise<Result<RefundResult, PaymentError>>;
}

// Implementation (infrastructure layer) — specific to provider
class StripePaymentGateway implements PaymentGateway {
  constructor(
    private client: StripeClient,
    private circuitBreaker: CircuitBreaker,
    private logger: Logger
  ) {}

  async charge(amount: Money, method: PaymentMethod): Promise<Result<ChargeResult, PaymentError>> {
    return this.circuitBreaker.execute(async () => {
      const response = await this.client.charges.create({...});
      return this.mapResponse(response);
    });
  }
}
```

### Client Configuration

| Parameter | Recommended Value | Notes |
|-----------|------------------|-------|
| Connect timeout | 5 seconds | Time to establish connection |
| Read timeout | 10 seconds | Time waiting for response |
| Total timeout | 30 seconds | Maximum wall clock time |
| Max retries | 3 | For idempotent operations only |
| Connection pool size | 10-50 | Based on expected concurrency |
| Keep-alive | Enabled | Reuse connections |

---

## Webhook Handling

### Receiving Webhooks

```
External Service → Your Webhook Endpoint → Queue → Async Processor
```

### Security Checklist

- [ ] Verify webhook signature (HMAC, RSA, or provider-specific)
- [ ] Validate source IP (if provider publishes IP ranges)
- [ ] Respond quickly (200 OK) then process asynchronously
- [ ] Idempotent processing (webhooks may be delivered multiple times)
- [ ] Reject replay attacks (check timestamp freshness)

### Webhook Endpoint Design

```typescript
async function handleWebhook(request: Request): Response {
  // 1. Verify signature immediately
  if (!verifySignature(request)) {
    return new Response(401);  // Don't reveal why it failed
  }

  // 2. Parse and validate payload
  const event = parseWebhookEvent(request.body);
  if (!event) {
    return new Response(400);
  }

  // 3. Enqueue for async processing (respond fast)
  await queue.enqueue('webhook-processing', {
    provider: 'stripe',
    event: event,
    receivedAt: Date.now(),
  });

  // 4. Respond immediately (before processing)
  return new Response(200);
}
```

### Webhook Reliability

| Concern | Solution |
|---------|----------|
| Missed webhooks | Periodic reconciliation job (poll provider API) |
| Duplicate delivery | Idempotency key on event ID |
| Out-of-order delivery | Check event timestamp, handle gracefully |
| Provider outage | Reconciliation catches up when they recover |
| Our outage | Provider retries; have alerting on missed events |

---

## Retry Strategy

### When to Retry

| Error Type | Retry? | Notes |
|-----------|--------|-------|
| Network timeout | Yes | Transient, likely to resolve |
| 429 Too Many Requests | Yes | After Retry-After delay |
| 500 Internal Server Error | Yes | Provider issue, may resolve |
| 502/503/504 | Yes | Infrastructure issue |
| 400 Bad Request | No | Our bug, won't change on retry |
| 401 Unauthorized | No | Credentials issue |
| 403 Forbidden | No | Permissions issue |
| 404 Not Found | No | Resource doesn't exist |
| 409 Conflict | Maybe | Depends on conflict type |

### Exponential Backoff

```
Attempt 1: Wait 1 second
Attempt 2: Wait 2 seconds
Attempt 3: Wait 4 seconds
Attempt 4: Wait 8 seconds (max backoff)
+ Random jitter (0-1 second) on each attempt
```

### Retry Configuration

```typescript
const retryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,        // 1 second
  maxDelay: 30000,           // 30 seconds
  backoffMultiplier: 2,
  jitter: true,              // Prevents thundering herd
  retryableStatuses: [429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'],
};
```

---

## Circuit Breaker

Prevents cascading failures by stopping calls to a failing service.

### States

```
CLOSED (normal) → failures exceed threshold → OPEN (failing fast)
                                                    │
                                              timeout expires
                                                    │
                                                    ▼
                                             HALF-OPEN (testing)
                                                    │
                                    ┌───────────────┼───────────────┐
                                    │                               │
                              probe succeeds                  probe fails
                                    │                               │
                                    ▼                               ▼
                               CLOSED                           OPEN
```

### Configuration

| Parameter | Value | Notes |
|-----------|-------|-------|
| Failure threshold | 5 failures in 30 seconds | Opens circuit |
| Success threshold | 3 consecutive successes | Closes circuit from half-open |
| Timeout | 60 seconds | Time in open state before probing |
| Half-open max probes | 1 | Requests allowed through in half-open |
| Monitored exceptions | Timeout, 5xx | What counts as failure |

### Fallback Strategies

When the circuit is open:

| Strategy | Use Case | Example |
|----------|----------|---------|
| Cached response | Data that's acceptable when stale | Cached exchange rate |
| Default value | Reasonable fallback exists | Default shipping estimate |
| Graceful degradation | Feature can be disabled | Hide recommendations |
| Queue for later | Action can be deferred | Queue email for later send |
| Error to user | No fallback possible | "Service temporarily unavailable" |

---

## Rate Limiting (Outbound)

Respect provider rate limits proactively, don't wait for 429 responses.

### Token Bucket Implementation

```typescript
class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per second

  async acquire(): Promise<void> {
    if (this.tokens > 0) {
      this.tokens--;
      return;
    }
    // Wait until a token is available
    await this.waitForToken();
  }
}
```

### Per-Provider Limits

Document known rate limits for each integration:

| Provider | Endpoint | Limit | Window | Our Budget |
|----------|----------|-------|--------|-----------|
| [Provider A] | /api/v1/* | 100 req | Per minute | Use 80% max |
| [Provider B] | /search | 10 req | Per second | Use 70% max |
| [Provider C] | /bulk | 1000 req | Per hour | Use 90% max |

---

## Data Mapping

### Boundary Anti-Corruption Layer

Never let external data models leak into your domain:

```typescript
// External model (their schema)
interface StripeCharge {
  id: string;
  amount: number;          // cents
  currency: string;
  status: string;
  created: number;         // unix timestamp
  metadata: Record<string, string>;
}

// Domain model (our schema)
interface PaymentCharge {
  externalId: string;
  amount: Money;           // our value object
  status: PaymentStatus;   // our enum
  createdAt: Date;         // standard Date
  orderId: string;         // extracted from metadata
}

// Mapper (infrastructure layer)
function mapStripeCharge(stripe: StripeCharge): PaymentCharge {
  return {
    externalId: stripe.id,
    amount: Money.fromCents(stripe.amount, stripe.currency),
    status: mapStripeStatus(stripe.status),
    createdAt: new Date(stripe.created * 1000),
    orderId: stripe.metadata.orderId,
  };
}
```

---

## Integration Testing

| Level | What It Tests | When to Run |
|-------|---------------|-------------|
| Unit (mocked) | Mapping logic, error handling | Every commit |
| Contract tests | API schema hasn't changed | Daily / PR |
| Sandbox integration | Real calls to sandbox env | Daily |
| Production smoke | Health check against real API | Continuous |

### Sandbox vs Mock

- **Mocks:** For unit tests, fast, deterministic, test error scenarios
- **Sandbox:** For integration tests, verify actual API behavior, test edge cases
- **Record/replay:** Capture real responses, replay in CI (Polly, VCR, nock)

---

## Integration Health Dashboard

Track per integration:

| Metric | Alert Threshold |
|--------|----------------|
| Success rate | < 99% |
| Latency (p95) | > 2x baseline |
| Error rate by type | Any new error type |
| Rate limit headroom | < 20% remaining |
| Circuit breaker state | Any circuit OPEN |
| Webhook delivery lag | > 5 minutes |

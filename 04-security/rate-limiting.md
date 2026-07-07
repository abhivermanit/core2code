# Rate Limiting

## Principle

Rate limiting protects your application from abuse, brute-force attacks, and resource exhaustion. Apply it at multiple levels with different strategies depending on the endpoint sensitivity.

---

## Patterns

### Fixed Window

Simplest approach. Count requests per time window (e.g., 100 requests per minute).

- Pros: Simple, low memory
- Cons: Burst at window boundaries (2x theoretical limit)
- Use for: General API limits

### Sliding Window

Weighted combination of current and previous window. Smoother than fixed window.

- Pros: No burst at boundaries
- Cons: Slightly more complex
- Use for: Most production APIs

### Token Bucket

Tokens refill at a steady rate. Each request consumes a token. Burst allowed up to bucket capacity.

- Pros: Allows controlled bursts, smooth rate
- Cons: More complex to implement
- Use for: APIs that need burst tolerance

### Leaky Bucket

Requests queue and drain at a fixed rate. Excess requests are dropped.

- Pros: Consistent processing rate
- Cons: Adds latency under burst
- Use for: Rate-sensitive operations (email sending, SMS)

---

## Limit Types

| Type | Scope | Example | Use Case |
|------|-------|---------|----------|
| Per-IP | Source IP | 100 req/min per IP | Anonymous endpoints, prevent DDoS |
| Per-User | Authenticated user | 1000 req/min per user | Authenticated APIs |
| Per-Endpoint | Specific route | 5 req/min on /login | Brute-force prevention |
| Per-Tenant | Organization/team | 10,000 req/min per org | Multi-tenant SaaS |
| Global | Entire service | 50,000 req/min total | Protect infrastructure |

---

## Recommended Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Login/Authentication | 5 attempts | Per minute per IP |
| Password reset | 3 requests | Per hour per email |
| Registration | 3 accounts | Per hour per IP |
| API (authenticated) | 100-1000 requests | Per minute per user |
| API (anonymous) | 20-60 requests | Per minute per IP |
| File upload | 10 uploads | Per hour per user |
| Webhooks (outgoing) | 100 events | Per minute per subscription |
| Search/expensive queries | 10 requests | Per minute per user |

---

## Implementation

```typescript
import { RateLimiter } from 'rate-limiter';

// Redis-backed sliding window
const apiLimiter = new RateLimiter({
  store: redisStore,
  windowMs: 60 * 1000,   // 1 minute
  max: 100,               // 100 requests per window
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please retry later.',
        retryAfter: res.getHeader('Retry-After'),
      },
    });
  },
});

// Stricter limit for auth endpoints
const authLimiter = new RateLimiter({
  store: redisStore,
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => `auth:${req.ip}`,
});

// Apply
app.use('/api/', apiLimiter);
app.use('/auth/', authLimiter);
```

---

## Response Headers

Always include rate limit information in responses:

```
X-RateLimit-Limit: 100          # Max requests in window
X-RateLimit-Remaining: 42       # Requests remaining
X-RateLimit-Reset: 1705312800   # Unix timestamp when window resets
Retry-After: 30                 # Seconds until retry (on 429 response)
```

---

## Bypass Prevention

| Attack | Prevention |
|--------|-----------|
| IP rotation (proxies, Tor) | Combine IP + fingerprinting; use CAPTCHA after threshold |
| Distributed attacks | Global rate limit + per-user limits |
| API key sharing | Per-key limits + anomaly detection |
| Header spoofing (`X-Forwarded-For`) | Trust only your own reverse proxy's headers |
| Slowloris (slow requests) | Connection timeout + request timeout |
| Account enumeration via timing | Consistent response times regardless of result |

### Trust the Right Headers

```typescript
// Only trust X-Forwarded-For from YOUR reverse proxy
// Do NOT trust it from arbitrary clients
function getClientIp(req: Request): string {
  if (req.connection.remoteAddress === TRUSTED_PROXY_IP) {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  }
  return req.connection.remoteAddress;
}
```

---

## Multi-Layer Rate Limiting

```
Layer 1: CDN/WAF         → Global DDoS protection (Cloudflare, AWS WAF)
Layer 2: Load Balancer   → Per-IP connection limits
Layer 3: API Gateway     → Per-user/per-key rate limits
Layer 4: Application     → Per-endpoint business logic limits
Layer 5: Database        → Connection pool limits
```

---

## Graceful Degradation

When under heavy load, prefer degradation over hard failure:

1. **Warn** — Return `X-RateLimit-Remaining: 10` so clients can back off
2. **Throttle** — Slow responses instead of rejecting (for internal services)
3. **Reject** — 429 with `Retry-After` for exceeded limits
4. **Block** — Temporary IP ban for sustained abuse (automated)

---

## Anti-Patterns

- **No rate limiting** — Every endpoint must have some limit.
- **Rate limiting only on login** — APIs, search, file upload all need limits.
- **Trusting `X-Forwarded-For` from clients** — Only trust from your own proxy.
- **Hard-coded limits with no observability** — Monitor actual usage to set appropriate limits.
- **Same limit for all endpoints** — Expensive operations need stricter limits.
- **No `Retry-After` header** — Clients need to know when to retry.

# Performance Testing

## Principle

Performance testing validates that your system meets speed, scalability, and stability requirements under expected and extreme conditions. Test before users complain, not after.

---

## Test Types

### Load Testing

Simulates expected user load to verify the system handles normal traffic.

- **Goal:** Confirm response times and throughput meet SLAs under typical load
- **Duration:** 10-30 minutes at steady state
- **Load:** Expected peak traffic (e.g., 500 concurrent users)

### Stress Testing

Pushes beyond normal capacity to find the breaking point.

- **Goal:** Identify where the system fails and how it fails (gracefully or catastrophically)
- **Duration:** Gradually increase until failure
- **Load:** 2x-10x normal traffic

### Soak Testing (Endurance)

Runs at normal load for extended periods to find memory leaks, connection pool exhaustion, and degradation.

- **Goal:** Verify system stability over time
- **Duration:** 4-24 hours
- **Load:** Normal expected traffic, sustained

### Spike Testing

Simulates sudden burst of traffic (flash sale, viral moment).

- **Goal:** Verify auto-scaling, queue behavior, and graceful degradation
- **Duration:** Short burst (1-5 minutes) with ramp-up/down
- **Load:** 5x-20x normal traffic, sudden onset

---

## Tools

| Tool | Type | Best For |
|------|------|----------|
| k6 | Code-based | Developer-friendly, CI integration, scripted scenarios |
| Locust | Python-based | Complex user flows, distributed testing |
| Artillery | YAML/JS | Quick setup, API testing |
| Gatling | Scala-based | Enterprise, detailed reports |
| hey / ab | CLI | Quick one-off benchmarks |
| Playwright (with timing) | E2E | Frontend performance |

### k6 Example

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Hold at 100 users
    { duration: '2m', target: 200 },  // Ramp to 200 users
    { duration: '5m', target: 200 },  // Hold at 200 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95) < 500', 'p(99) < 1000'], // 95th < 500ms, 99th < 1s
    http_req_failed: ['rate < 0.01'],                     // < 1% error rate
  },
};

export default function () {
  const res = http.get('https://api.example.com/orders', {
    headers: { Authorization: `Bearer ${__ENV.API_TOKEN}` },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1); // Think time between requests
}
```

---

## Scenarios to Test

| Scenario | What It Validates |
|----------|-------------------|
| API endpoint response times | Individual endpoint performance |
| Database query performance | Slow queries under concurrent access |
| Authentication flow | Token validation throughput |
| File upload/download | I/O handling under load |
| Search functionality | Full-text search at scale |
| Concurrent writes | Database locking, race conditions |
| Third-party API calls | Timeout handling, circuit breakers |
| WebSocket connections | Connection limits, message throughput |

---

## Baselines and Thresholds

### Establish Baselines

Before performance testing is meaningful, you need baselines:

```
1. Run load test at current traffic level
2. Record: p50, p95, p99 response times, error rate, throughput
3. This becomes your baseline
4. Future tests compare against baseline
5. Alert when regression exceeds threshold (e.g., p95 increases > 20%)
```

### Recommended Thresholds

| Metric | Target (API) | Target (Web Page) |
|--------|-------------|-------------------|
| p50 response time | < 100ms | < 1s (LCP) |
| p95 response time | < 500ms | < 2.5s (LCP) |
| p99 response time | < 1000ms | < 4s (LCP) |
| Error rate | < 0.1% | < 0.1% |
| Throughput | Per SLA | N/A |
| Availability | > 99.9% | > 99.9% |

---

## CI Integration

```yaml
# Run performance tests on staging before production deploy
performance-test:
  stage: pre-deploy
  script:
    - k6 run --out json=results.json tests/performance/load-test.js
    - k6 run tests/performance/smoke-test.js  # Quick sanity (every deploy)
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# Full load test (scheduled, not every deploy)
nightly-load-test:
  schedule: "0 2 * * *"  # 2 AM daily
  script:
    - k6 run tests/performance/full-load.js
    - compare-with-baseline results.json
```

---

## What to Monitor During Tests

- Response times (p50, p95, p99)
- Error rate
- Throughput (requests/second)
- CPU and memory usage
- Database connection pool utilization
- Network I/O
- Queue depths
- Cache hit rates
- Auto-scaling events

---

## Anti-Patterns

- **Testing in development environment** — Use production-like infrastructure.
- **No baselines** — Can't detect regressions without a known-good state.
- **Testing only happy paths** — Include error scenarios (4xx, 5xx responses).
- **No think time** — Real users don't fire requests back-to-back. Add sleep.
- **Testing once before launch, never again** — Performance degrades over time. Test regularly.
- **Ignoring client-side performance** — API is fast but page loads slow = user doesn't care about your API metrics.

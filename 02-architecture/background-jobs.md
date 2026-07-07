# Background Jobs

Background processing handles work that doesn't need to happen in the request-response cycle. If the user doesn't need to wait for it, don't make them.

---

## When to Use Background Jobs

### Move to Background When:
- Processing takes > 500ms
- User doesn't need the result immediately
- Work can be retried safely
- Workload is spiky (smooth with a queue)
- External service calls are unreliable
- You need rate limiting against an external API

### Keep Synchronous When:
- User needs the result to proceed
- Operation is fast (< 200ms)
- Failure must be reported immediately
- Transaction integrity requires it

---

## Job Types

| Type | Trigger | Examples |
|------|---------|---------|
| Event-driven | Domain event published | Send email, update search index, notify webhook |
| Scheduled | Cron/interval | Daily reports, cleanup, data sync |
| Deferred | Delayed execution | Reminder emails, trial expiration, SLA checks |
| Batch | Bulk data operation | Data import, bulk notifications, report generation |
| Recurring | Fixed interval per entity | Subscription billing, health checks |

---

## Queue Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Producer    │────▶│    Queue     │────▶│   Worker(s)   │
│ (App Server)  │     │  (Redis/SQS) │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                            │                      │
                            │                      ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Dead Letter  │     │   Results     │
                     │    Queue      │     │   Store       │
                     └──────────────┘     └──────────────┘
```

### Queue Selection

| Tool | Best For | Trade-offs |
|------|----------|-----------|
| Redis + BullMQ | Simple job queues, delays, priorities | Single point of failure without cluster |
| SQS | AWS native, serverless, simple FIFO | No priority queues, limited visibility |
| RabbitMQ | Complex routing, multiple consumers | Operational complexity |
| Kafka | Event streaming, replay, high throughput | Overkill for simple jobs |
| PostgreSQL (SKIP LOCKED) | Simple queues without extra infrastructure | Limited features, polling |

---

## Job Design Principles

### 1. Idempotency

Every job must be safe to execute multiple times with the same result.

```typescript
async function processPaymentJob(job: Job<PaymentJobData>) {
  // Check if already processed (idempotency key)
  const existing = await paymentStore.findByIdempotencyKey(job.data.idempotencyKey);
  if (existing) {
    return existing; // Already done, return cached result
  }

  // Process
  const result = await paymentGateway.charge(job.data);

  // Store result with idempotency key
  await paymentStore.save(result, job.data.idempotencyKey);

  return result;
}
```

### 2. Atomicity

Each job does one logical thing. If a job needs to do A, B, and C, and B can fail independently, make them three jobs.

### 3. Small Payload

Store references in the job, not the full data. Data may change between enqueue and processing.

```typescript
// Good: Reference
queue.add('process-order', { orderId: 'ord_123' });

// Bad: Full data (may be stale when processed)
queue.add('process-order', { order: { id: 'ord_123', items: [...], total: 9999 } });
```

### 4. Timeout

Every job has a maximum execution time. Stuck jobs should be killed and retried.

---

## Retry Strategy

### Configuration

```typescript
const jobOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000,  // 1s, 2s, 4s, 8s, 16s
  },
  timeout: 30000,     // Kill after 30 seconds
  removeOnComplete: true,
  removeOnFail: false, // Keep failed jobs for inspection
};
```

### Retry Decision Matrix

| Failure Type | Retry? | Strategy |
|-------------|--------|----------|
| Network timeout | Yes | Exponential backoff |
| Rate limited (429) | Yes | Respect Retry-After header |
| Server error (5xx) | Yes | Exponential backoff |
| Validation error (4xx) | No | Send to DLQ |
| Business logic error | No | Send to DLQ |
| Unknown error | Yes (limited) | 1-2 retries then DLQ |

### Dead Letter Queue Handling

When a job exhausts all retries:

1. Move to dead letter queue with full context
2. Alert the team (Slack, PagerDuty)
3. Retain for investigation (7 days minimum)
4. Provide manual replay capability
5. Track DLQ depth as a metric

---

## Scheduling

### Cron Jobs

| Job | Schedule | Duration | Concurrency | Notes |
|-----|----------|----------|-------------|-------|
| Daily report generation | 02:00 UTC | ~5 min | 1 (no overlap) | |
| Expired session cleanup | Every hour | ~2 min | 1 | |
| External data sync | Every 15 min | ~3 min | 1 | |
| Trial expiration check | 06:00 UTC | ~1 min | 1 | |
| Database vacuum/analyze | 03:00 UTC (Sunday) | ~30 min | 1 | |

### Scheduling Rules

- All times in UTC
- Jobs must be idempotent (cron can double-fire)
- No overlap: use distributed locks if needed
- Monitor execution duration (alert if 2x normal)
- Schedule compute-heavy jobs during off-peak hours
- Stagger jobs (don't schedule everything at midnight)

### Distributed Lock (for scheduled jobs)

```typescript
async function runScheduledJob(jobName: string, fn: () => Promise<void>) {
  const lock = await distributedLock.acquire(jobName, { ttl: 300_000 }); // 5 min
  if (!lock) {
    return; // Another instance is running this job
  }

  try {
    await fn();
  } finally {
    await lock.release();
  }
}
```

---

## Concurrency and Rate Limiting

### Worker Concurrency

| Job Type | Concurrency | Rationale |
|----------|-------------|-----------|
| Email sending | 10 | Rate limited by provider |
| Image processing | 4 | CPU-bound |
| API calls to vendor | 5 | Respect their rate limit |
| Database-heavy | 2 | Don't overwhelm DB |
| Report generation | 1 | Sequential, resource-heavy |

### Rate Limiting Outbound Jobs

```typescript
const emailQueue = new Queue('email', {
  limiter: {
    max: 50,        // Maximum 50 jobs
    duration: 1000, // Per second
  },
});
```

---

## Priority Queues

| Priority | Use Case | Processing Order |
|----------|----------|-----------------|
| Critical (1) | Payment processing, security alerts | Immediate |
| High (2) | User-facing notifications | Within 1 minute |
| Normal (3) | Standard async processing | Within 5 minutes |
| Low (4) | Reports, analytics, cleanup | Within 1 hour |
| Bulk (5) | Mass operations, imports | Best effort |

---

## Monitoring

| Metric | Alert Threshold | Notes |
|--------|----------------|-------|
| Queue depth | > 1000 jobs waiting | Workers can't keep up |
| Processing latency | > 5 min for high priority | SLA breach |
| Failure rate | > 5% | Something broken |
| DLQ depth | > 0 | Requires investigation |
| Worker utilization | > 90% sustained | Scale up needed |
| Oldest pending job | > 30 min (normal priority) | Processing stalled |
| Job duration (p95) | > 2x baseline | Performance regression |

---

## Testing Background Jobs

| Test Type | What to Test | How |
|-----------|-------------|-----|
| Unit | Job logic in isolation | Mock dependencies, call handler directly |
| Integration | Queue mechanics, retry behavior | Real queue (Redis), test timeouts |
| Idempotency | Same job processed twice = same result | Execute handler twice, assert single effect |
| Failure | Proper DLQ routing on permanent failure | Force error, verify DLQ |
| Load | Throughput under realistic load | Enqueue N jobs, measure drain time |

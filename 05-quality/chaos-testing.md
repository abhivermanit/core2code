# Chaos Testing

## Principle

Chaos engineering proactively injects failure into systems to verify they handle it gracefully. The question isn't *if* things will fail — it's *when* and *how badly*. Build confidence in your system's resilience by breaking it intentionally.

---

## What is Chaos Engineering?

A disciplined approach to identifying weaknesses:

1. Define "steady state" (normal system behavior)
2. Hypothesize that steady state will continue during failure
3. Introduce failure (network, service, resource)
4. Observe actual behavior vs hypothesis
5. Fix what broke

---

## Failure Injection Types

### Infrastructure Failures

| Failure | Injection Method | Verifies |
|---------|-----------------|----------|
| Server crash | Kill process/container | Auto-restart, failover |
| Network partition | Block traffic between services | Graceful degradation |
| DNS failure | Block DNS resolution | Timeout handling, cached resolvers |
| Disk full | Fill filesystem | Proper error handling, alerts |
| High CPU | Stress process | Autoscaling, queue backpressure |
| Memory exhaustion | Memory stress tool | OOM handling, graceful shutdown |
| Clock skew | Adjust system time | Time-dependent logic (tokens, caches) |

### Application Failures

| Failure | Injection Method | Verifies |
|---------|-----------------|----------|
| Slow responses | Add artificial latency | Timeouts, circuit breakers |
| Error responses | Return 500s randomly | Retry logic, error handling |
| Connection refused | Stop dependent service | Fallback behavior |
| Corrupted responses | Return malformed data | Input validation, error boundaries |
| Resource pool exhaustion | Saturate connection pool | Queuing, backpressure |

### Dependency Failures

| Failure | Injection Method | Verifies |
|---------|-----------------|----------|
| Database down | Stop DB, block port | Cached reads, queue writes |
| Cache unavailable | Stop Redis/Memcached | Fallback to DB, no crash |
| Message queue down | Stop broker | Message persistence, retry |
| Third-party API down | Block outbound requests | Circuit breaker, degraded mode |
| CDN failure | Block CDN domains | Fallback origins |

---

## Game Days

Scheduled exercises where the team intentionally causes failures and practices response.

### Game Day Structure

```
Preparation (1 week before):
- Define scope (which systems, which failures)
- Set success criteria
- Ensure rollback plan exists
- Notify stakeholders

Execution (2-4 hours):
- Brief participants on scenario
- Inject failure
- Observe system behavior
- Team responds as if real incident
- Collect observations

Debrief (same day):
- What happened vs what was expected?
- What monitoring caught it? What didn't?
- What was the user impact?
- What needs to be fixed?
- Schedule follow-ups
```

### Example Game Day Scenarios

1. **"The database is gone"** — Primary database becomes unreachable. Does the app fail gracefully? Does the read replica take over?
2. **"A key service is slow"** — Add 5 seconds latency to the auth service. Do downstream services time out correctly?
3. **"Secrets rotated unexpectedly"** — Revoke a service's API key. Does it recover when the new key is deployed?
4. **"Traffic spike"** — Send 10x normal traffic for 10 minutes. Does autoscaling work?

---

## Recovery Verification

Chaos testing isn't just about failure — it's about recovery.

### Verify

- [ ] System detects the failure (alerting fires)
- [ ] System degrades gracefully (not catastrophic cascade)
- [ ] Users see helpful error (not 500 page or infinite spinner)
- [ ] System recovers automatically when failure is resolved
- [ ] No data loss or corruption during failure period
- [ ] No stuck state after recovery (connections, locks, queues)
- [ ] Recovery time within SLA (minutes, not hours)

---

## Tools

| Tool | Type | Best For |
|------|------|----------|
| Chaos Monkey (Netflix) | Kill instances | VM/container resilience |
| Litmus Chaos | Kubernetes-native | K8s pod/network failures |
| Gremlin | Platform | Enterprise, controlled experiments |
| Toxiproxy | Network proxy | Simulating network conditions |
| tc (Linux traffic control) | Network | Latency, packet loss |
| kill -9, docker stop | Process | Quick and dirty |

### Toxiproxy Example

```typescript
// Add latency to Redis connection
await toxiproxy.addToxic('redis-upstream', {
  type: 'latency',
  attributes: { latency: 2000, jitter: 500 },
});

// Verify the app handles slow Redis gracefully
const startTime = Date.now();
const response = await api.get('/dashboard');
const elapsed = Date.now() - startTime;

// App should timeout and fall back, not hang indefinitely
expect(elapsed).toBeLessThan(5000);
expect(response.status).toBe(200); // Degraded but functional
```

---

## Starting Small

Don't start by killing production databases. Build up gradually:

| Level | Environment | Scope |
|-------|-------------|-------|
| 1. Unit | Local/CI | Test timeout handling, retry logic in code |
| 2. Integration | Staging | Kill a single dependency, verify fallback |
| 3. System | Staging | Network partition between services |
| 4. Game Day | Staging (then prod) | Full scenario with team response |
| 5. Continuous | Production | Automated, controlled failure injection |

---

## Safety Rules

- **Always have a kill switch.** Ability to stop the experiment instantly.
- **Start in non-production.** Graduate to production only with confidence.
- **Minimize blast radius.** Affect one service, one region, or one user segment.
- **Monitor actively.** Don't inject failure and walk away.
- **Communicate.** Team knows experiments are running. Customers don't notice.
- **Have a hypothesis.** "I expect the system will..." — not random destruction.

---

## Anti-Patterns

- **"Let's see what happens"** without a hypothesis — That's just breaking things randomly.
- **Chaos testing in production without safety nets** — Start in staging. Prove it's safe first.
- **Never testing** — "Our system is too critical to test failures" means you'll discover failures from users instead.
- **Only testing happy recovery** — Also test: what if recovery fails? What if the failure cascades?
- **Chaos testing without observability** — If you can't see what's happening, you can't learn from it.
- **One-time exercise** — Chaos testing is continuous. Systems change. Test regularly.

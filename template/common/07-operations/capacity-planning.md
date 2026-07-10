# Capacity Planning

Running out of capacity during a traffic spike is a choice you made months ago. Capacity planning prevents it.

## Growth Forecasting

### Data-Driven Forecasting

```
1. Collect historical data (6+ months minimum)
2. Identify growth rate (linear, exponential, seasonal)
3. Project forward 3-6 months
4. Add buffer (50-100% above projection)
5. Plan capacity to meet buffer
```

### Key Metrics to Forecast

| Metric | Source | Growth Factor |
|--------|--------|---------------|
| Requests per second | Load balancer metrics | User growth × engagement |
| Database connections | Connection pool metrics | Services × instances |
| Storage volume | Disk usage trend | Users × data per user |
| Memory usage | Container metrics | Features × data cached |
| Bandwidth | Network metrics | Users × payload sizes |

### Seasonal Patterns

Identify and plan for:
- Daily peaks (morning vs. evening traffic)
- Weekly patterns (weekday vs. weekend)
- Monthly spikes (billing cycles, end-of-month)
- Annual events (holidays, Black Friday, back-to-school)
- Marketing campaigns (plan with marketing team)

## Load Testing

### Types of Load Tests

| Test Type | Purpose | When to Run |
|-----------|---------|-------------|
| Baseline | Establish normal performance | Quarterly |
| Stress | Find breaking point | Before major launches |
| Spike | Test sudden traffic surge | Quarterly |
| Soak | Find memory leaks, connection exhaustion | Monthly |
| Capacity | Validate provisioned resources | After scaling changes |

### Load Test Process

```
1. Define success criteria (latency, error rate, throughput targets)
2. Set up realistic test environment (production-like)
3. Generate realistic traffic patterns (not just GET /health)
4. Ramp gradually: 10% → 25% → 50% → 75% → 100% → 125% of expected peak
5. Monitor all layers: app, DB, cache, network, external deps
6. Identify bottleneck (first component to degrade)
7. Document results and share with team
8. Fix bottleneck, repeat
```

### What to Test

- Critical user journeys (not just individual endpoints)
- Write-heavy operations (creates, updates, payments)
- Search and listing queries (often slowest)
- Authentication under load
- Background job processing rate
- WebSocket/long-poll connections
- File upload/download

### Tools

| Tool | Best For |
|------|----------|
| k6 | Developer-friendly, scriptable |
| Locust | Python-based, distributed |
| Artillery | Node.js based, YAML config |
| Gatling | JVM, detailed reporting |
| hey/ab | Quick single-endpoint tests |

## Scaling Triggers

### Auto-Scaling Configuration

```yaml
scaling:
  min_instances: 2
  max_instances: 20
  target_cpu: 60%          # Scale up before hitting 80%
  target_memory: 70%
  scale_up_cooldown: 60s   # Don't thrash
  scale_down_cooldown: 300s # Slow to scale down (avoid flapping)
```

### Scaling Decision Matrix

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU > 60% sustained 5 min | Auto-scale | Add compute instances |
| Memory > 70% sustained 10 min | Auto-scale | Add instances or increase per-instance |
| DB connections > 80% pool | Manual | Increase pool size or add read replicas |
| Queue depth growing > 5 min | Auto-scale | Add workers |
| Disk > 80% | Alert | Expand volume or archive data |
| Latency p99 > 2x baseline | Investigate | Profile, optimize, or scale |

### When NOT to Auto-Scale

- Database (scale vertically with planning, not reactively)
- Stateful services (need careful draining)
- Cost-uncapped resources (set hard maximums)
- When the bottleneck is downstream (scaling the client doesn't help if the DB is full)

## Resource Reservation

### Base Capacity

Always maintain enough capacity for:
- Normal peak traffic without scaling events
- One availability zone failure (N+1 redundancy)
- Graceful degradation during scaling cooldowns

```
Rule of thumb: 
  Base capacity = average peak × 1.5
  Max capacity = base × 3 (for spikes)
  Database = plan for 2x current size (harder to scale)
```

### Reservation Strategy

| Resource | Strategy |
|----------|----------|
| Compute | Reserve base, auto-scale burst |
| Database | Over-provision by 40% (hard to scale quickly) |
| Storage | Auto-expand with alerts at 70% |
| Network | Plan for 3x average bandwidth |
| Cache | Reserve for full working set + 30% |

## Capacity Review

### Monthly

- Review utilization trends
- Are we approaching any limits?
- Is auto-scaling working correctly?
- Cost vs. capacity efficiency

### Quarterly

- Growth forecast update
- Load test against updated projections
- Database capacity review (hardest to scale)
- Reserve instance adjustments

### Before Major Events

- Marketing campaign expected traffic estimate
- Load test at expected peak
- Pre-scale resources (don't rely on auto-scaling for known events)
- Prepare runbook for traffic management (rate limiting, queuing)

## Anti-Patterns

- **No capacity planning** — "we'll scale when we need to" is too late
- **Only scaling up, never down** — costs grow without bound
- **Over-provisioning everything** — expensive and masks performance issues
- **Load testing in production** — use a dedicated load test environment
- **Assuming linear scaling** — databases and shared resources don't scale linearly
- **Ignoring dependencies** — your service scales but the downstream database doesn't
- **Planning for average, not peak** — traffic spikes don't care about averages

# Monitoring

If you can't see it, you can't fix it. Monitoring tells you what's happening before your users tell you something's wrong.

## RED Method (Request-driven services)

For every service, measure:

| Metric | What it Measures | Alert Threshold |
|--------|-----------------|-----------------|
| **R**ate | Requests per second | Sudden drop or spike |
| **E**rrors | Failed requests / total | > 1% of requests |
| **D**uration | Latency (p50, p95, p99) | p99 > 2x baseline |

## USE Method (Resources)

For every resource (CPU, memory, disk, network):

| Metric | What it Measures | Alert Threshold |
|--------|-----------------|-----------------|
| **U**tilization | % of capacity in use | > 80% sustained |
| **S**aturation | Queue depth, waiting work | > 0 sustained |
| **E**rrors | Resource-level errors | Any |

## SLIs (Service Level Indicators)

Concrete measurements that define service health:

```
Availability SLI = successful requests / total requests
Latency SLI = requests served < threshold / total requests
Throughput SLI = actual throughput / expected throughput
Correctness SLI = correct responses / total responses
```

## SLOs (Service Level Objectives)

Targets for your SLIs. Internal commitments:

```
Availability: 99.9% of requests succeed (43 min downtime/month budget)
Latency: 95% of requests < 200ms, 99% < 1s
Error rate: < 0.1% of requests return 5xx
```

### Error Budgets

```
Monthly error budget = 1 - SLO target
  99.9% SLO = 0.1% error budget = 43 minutes/month

If budget consumed:
  - Stop feature work
  - Focus on reliability
  - No deploys until budget recovers
```

## Dashboard Design

### Service Overview Dashboard

```
Row 1: Request rate | Error rate | Latency (p50/p95/p99)
Row 2: Active users | Success rate | Apdex score
Row 3: CPU | Memory | Disk | Network
Row 4: Database connections | Cache hit rate | Queue depth
```

### Per-Service Dashboard

```
Row 1: Throughput by endpoint
Row 2: Error breakdown by type (4xx vs 5xx)
Row 3: Latency heatmap
Row 4: Dependency health (DB, cache, external APIs)
Row 5: Recent deployments overlay
```

### Rules for Good Dashboards

- Every dashboard has a purpose (don't make "just in case" dashboards)
- 5-7 panels maximum per view (more = cognitive overload)
- Show time-series with deployment markers
- Use consistent color: green = good, yellow = degraded, red = broken
- Default time range: last 1 hour (incident) or last 24 hours (overview)

## Four Golden Signals

Google SRE's simplified monitoring framework:

1. **Latency** — time to serve a request (distinguish success vs. error latency)
2. **Traffic** — demand on the system (requests/sec, sessions, transactions)
3. **Errors** — rate of failed requests (explicit 5xx + implicit timeout/wrong answer)
4. **Saturation** — how full the system is (CPU, memory, I/O, queue depth)

## What to Monitor

### Application Layer
- Request rate and error rate per endpoint
- Response time percentiles (p50, p95, p99)
- Active connections/sessions
- Background job queue depth and processing time
- Cache hit/miss ratio

### Infrastructure Layer
- CPU, memory, disk utilization
- Network I/O and packet loss
- Container restarts and OOM kills
- Auto-scaling events

### Business Layer
- Signup rate, conversion rate
- Revenue per minute (for ecommerce)
- Active users (real-time)
- Feature usage rates

### Dependency Layer
- External API response times
- Database query latency and connection pool usage
- Cache latency and eviction rate
- Message queue lag

## Tool Recommendations

| Purpose | Tools |
|---------|-------|
| Metrics | Prometheus + Grafana, Datadog, CloudWatch |
| APM | Datadog APM, New Relic, Elastic APM |
| Uptime | Better Uptime, Pingdom, UptimeRobot |
| Status page | Statuspage, Instatus, Cachet |
| Synthetic monitoring | Checkly, Datadog Synthetics |

## Anti-Patterns

- **Dashboard without alerts** — if nobody's watching, dashboards don't help
- **Monitoring only infrastructure** — your CPU is fine but users can't log in
- **Average-only metrics** — averages hide outliers. Use percentiles.
- **Too many metrics** — signal drowns in noise. Monitor what you'd act on.
- **No baseline** — you can't detect anomalies without knowing normal
- **Monitoring as afterthought** — instrument from day one, not after the first outage

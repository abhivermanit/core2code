# Performance Testing

## Test Types

| Type | Purpose | When |
|------|---------|------|
| Load test | Verify under expected load | Pre-release |
| Stress test | Find breaking point | Quarterly |
| Soak test | Detect memory leaks | Monthly |
| Spike test | Handle traffic bursts | Pre-release |

## Scenarios

### Normal Load

- Simulate typical daily traffic pattern
- Duration: 30 minutes
- Expected: All SLOs met

### Peak Load

- Simulate 3x normal traffic
- Duration: 15 minutes
- Expected: P95 < 500ms, 0% errors

### Stress Test

- Ramp until failure
- Identify bottleneck
- Document breaking point

## Tools

- k6 (preferred for scripting)
- Artillery (for quick tests)
- Grafana (visualization)

## Baseline Tracking

- Record baselines after each release
- Alert on > 20% regression
- Track: P50, P95, P99, throughput, error rate

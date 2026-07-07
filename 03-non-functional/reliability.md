# Reliability

## Availability Target

- SLO: 99.9% (8.76 hours downtime/year)
- Measurement: Synthetic monitoring + real user metrics

## Failure Modes

| Failure | Detection | Recovery | RTO |
|---------|-----------|----------|-----|
| Service crash | Health check | Auto-restart | < 30s |
| Database failure | Connection errors | Failover | < 60s |
| Network partition | Timeout alerts | DNS failover | < 5min |
| Region outage | Cross-region check | Multi-region failover | < 15min |

## Resilience Patterns

- Circuit breakers
- Retries with exponential backoff
- Timeouts on all external calls
- Bulkheads (resource isolation)
- Graceful degradation

## Disaster Recovery

- RTO: < 1 hour
- RPO: < 5 minutes
- Backup frequency: Continuous / hourly
- Backup testing: Monthly restore drill
- Runbook: Documented and tested

## Chaos Engineering

- Regular failure injection
- Game days
- Dependency failure simulation

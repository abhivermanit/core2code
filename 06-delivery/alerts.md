# Alerts

An alert should mean: "something is broken or about to break, and a human needs to act." If your alerts don't meet that bar, they're noise.

## Alert Design Principles

1. **Every alert is actionable** — if you can't do anything about it, don't alert on it
2. **Alerts fire on symptoms, not causes** — alert on "users can't log in," not "CPU is high"
3. **Alerts have runbooks** — the alert links directly to what to do
4. **Alerts have owners** — every alert routes to a specific team
5. **False alerts are bugs** — tune or remove alerts that cry wolf

## Alert Conditions

### What to Alert On

| Condition | Severity | Example |
|-----------|----------|---------|
| Service down | Critical | Health check failing for 2+ minutes |
| Error rate spike | Critical | 5xx rate > 5% for 5 minutes |
| Latency degradation | High | p99 > 5s for 10 minutes |
| Resource exhaustion imminent | High | Disk > 90%, connections > 80% |
| SLO budget burning fast | High | Error budget consumed > 50% in 1 hour |
| Certificate expiring | Medium | SSL cert expires in < 14 days |
| Background job backlog | Medium | Queue depth > 10,000 for 15 minutes |
| Dependency degraded | Medium | External API error rate > 10% |

### What NOT to Alert On

- Informational metrics (deploy happened, user signed up)
- Auto-recovering transient errors (single timeout, single retry)
- Individual server issues when redundancy exists
- Anything you'd look at and dismiss without action

## Severity Levels

| Severity | Meaning | Response Time | Notification |
|----------|---------|---------------|--------------|
| Critical (P1) | Service down, data at risk | Immediate (< 5 min) | Page on-call, phone |
| High (P2) | Significant degradation | < 30 min | Page on-call, Slack |
| Medium (P3) | Minor degradation | < 4 hours | Slack channel |
| Low (P4) | Informational | Next business day | Email, ticket |

## Routing

```yaml
alerts:
  - name: "API Error Rate Critical"
    condition: error_rate > 5% for 5m
    severity: critical
    team: platform-on-call
    runbook: https://runbooks.internal/api-errors
    escalation:
      - after: 5min → on-call engineer (PagerDuty)
      - after: 15min → engineering manager
      - after: 30min → VP Engineering

  - name: "Payment Service Degraded"
    condition: payment_success_rate < 95% for 10m
    severity: high
    team: payments-on-call
    runbook: https://runbooks.internal/payment-degraded
```

### Routing Rules

- Critical/High → PagerDuty/Opsgenie → phone + SMS + push
- Medium → Slack channel + ticket created
- Low → Email digest + ticket
- After hours: only Critical and High page humans

## Alert Fatigue Prevention

Alert fatigue is the #1 killer of on-call effectiveness. When everything alerts, nothing gets attention.

### Rules to Prevent Fatigue

1. **Aggregate related alerts** — 50 pods restarting is one alert, not 50
2. **Use appropriate windows** — don't alert on a single data point. Use 5-minute windows minimum.
3. **Suppress during maintenance** — silence alerts for planned work
4. **Auto-resolve** — if the condition clears, close the alert automatically
5. **Review alert volume monthly** — if on-call gets >5 alerts/shift, something's wrong
6. **Delete unused alerts** — audit quarterly, remove what nobody acts on

### Alert Hygiene Metrics

Track these monthly:
- Total alerts fired
- Alerts per on-call shift
- Time to acknowledge
- False positive rate
- Alerts with no action taken (candidates for removal)

**Target:** < 5 actionable alerts per on-call shift.

## Alert Template

```yaml
name: Descriptive name of the problem
condition: metric > threshold for duration
severity: critical | high | medium | low
description: |
  What is happening in plain English.
  What the user impact is.
runbook: URL to step-by-step resolution
team: Who owns this service
escalation: Who to contact if not resolved in X minutes
tags:
  - service: checkout
  - component: payments
  - slo: availability
```

## Composite Alerts

Sometimes a single metric isn't enough. Combine signals:

```
Alert: "Checkout is broken"
  Condition: ALL of:
    - Checkout error rate > 5%
    - Payment API responding
    - Database reachable
  Meaning: The problem is in our checkout code, not dependencies
```

```
Alert: "Complete outage"
  Condition: ANY of:
    - Health check failing on all instances
    - Zero successful requests for 2 minutes
    - All database connections failed
```

## On-Call Integration

- Alert → PagerDuty/Opsgenie → On-call engineer
- Engineer acknowledges within 5 minutes
- If not acknowledged → escalate to backup
- After resolution → create incident ticket
- Weekly review of all alerts and actions taken

## Tools

| Tool | Best For |
|------|----------|
| PagerDuty | Enterprise on-call, escalation |
| Opsgenie | Atlassian ecosystem |
| Grafana Alerting | Prometheus/Loki-based alerts |
| Datadog Monitors | Integrated APM + alerts |
| Better Uptime | Simple uptime + on-call |

## Anti-Patterns

- **Alert on everything** — alert fatigue makes real alerts invisible
- **No runbook** — 3 AM is not the time to figure out what an alert means
- **Threshold too sensitive** — one blip triggers a page
- **Threshold too lenient** — alert fires after users already noticed
- **Alerts without owners** — unrouted alerts go to nobody
- **Never tuning alerts** — conditions change, thresholds drift
- **Duplicate alerts** — same problem, five different alerts fire simultaneously

# SLA / SLO / SLI

These three concepts form the foundation of reliability engineering. Get them right, and you can make rational decisions about reliability vs. feature velocity.

## Definitions

### SLI (Service Level Indicator)

A concrete measurement of service behavior. The raw metric.

```
Availability SLI = successful requests / total requests
Latency SLI = requests completed in < Xms / total requests
Throughput SLI = requests served per second
Correctness SLI = correct results / total results
```

### SLO (Service Level Objective)

A target value for an SLI. Your internal reliability commitment.

```
Availability SLO: 99.9% of requests succeed over 30 days
Latency SLO: 95% of requests complete in < 200ms
Throughput SLO: System handles 1000 req/s at p99 < 500ms
```

### SLA (Service Level Agreement)

A contractual commitment with consequences for missing it. External, legal, involves money.

```
Availability SLA: 99.9% uptime or customer receives service credits
Response time SLA: Support responds within 4 hours (business) or refund
```

**Key distinction:** SLOs are aspirational (internal). SLAs are contractual (external, consequences).

**Rule:** Your SLO should be stricter than your SLA. If your SLA is 99.9%, target 99.95% internally so you have buffer.

## Setting SLOs

### Step 1: Identify Critical User Journeys

```
1. User can sign up and log in
2. User can browse products
3. User can complete a purchase
4. User receives order confirmation
```

### Step 2: Define SLIs for Each Journey

```
Journey: "User can complete a purchase"
SLIs:
  - Checkout page loads in < 2s (latency)
  - Payment processing succeeds (availability)
  - Order confirmation sent within 60s (freshness)
```

### Step 3: Set Realistic Targets

| Tier | Availability | Monthly Downtime | When to Use |
|------|-------------|------------------|-------------|
| 99% | 7.3 hours | Internal tools, dev environments |
| 99.9% | 43 minutes | Most SaaS products |
| 99.95% | 22 minutes | Payment processing, auth |
| 99.99% | 4.3 minutes | Critical infrastructure |
| 99.999% | 26 seconds | Telecommunications, life safety |

**Start at 99.9% unless you have specific reasons to go higher.** Higher targets have exponentially higher cost.

### Step 4: Measure and Report

- Measure SLIs continuously
- Report SLO compliance weekly/monthly
- Track error budget consumption rate
- Alert when budget is burning too fast

## Error Budgets

```
Error Budget = 1 - SLO target

Example: 99.9% SLO over 30 days
  Error budget = 0.1% = 43 minutes of downtime
  Or: 4,320 failed requests out of 4,320,000
```

### How Error Budgets Work

- Budget is consumed by outages, errors, degradation
- While budget remains → ship features, take risks
- Budget running low → slow down, focus on reliability
- Budget exhausted → freeze deployments, fix reliability

### Error Budget Policy

```markdown
## Error Budget Consumption Actions

| Budget Remaining | Action |
|-----------------|--------|
| > 50% | Normal development, ship features |
| 25-50% | Increase testing, slower rollouts |
| 10-25% | Reliability sprint, reduce deploy frequency |
| < 10% | Feature freeze, all hands on reliability |
| Exhausted | No deploys until next budget period |
```

## Measurement

### Window Types

- **Rolling window (recommended):** Last 30 days, recalculated continuously
- **Calendar window:** This month (resets on the 1st)

Rolling windows are preferred because they don't create "budget reset" incentives (burning budget at end of month).

### Excluding Planned Maintenance

- Scheduled maintenance windows don't count against SLO
- Must be communicated to users in advance
- Emergency maintenance DOES count

### Multi-Region SLO

```
Global SLO: 99.99% availability
  = Any region available is "available"
  = Only fails if ALL regions are down simultaneously

Per-region SLO: 99.9%
  = Individual region can have more downtime
  = Redundancy provides the global guarantee
```

## Consequences of Missing SLOs

### Internal (SLO miss)

- Reliability retrospective
- Engineering time redirected to reliability
- Deploy frequency reduced
- Mandatory postmortem for contributing incidents

### External (SLA breach)

- Service credits issued to customer
- Contractual penalties
- Customer churn risk
- Executive escalation

## Communicating SLOs

### To Engineering

"Our checkout SLO is 99.95% availability. We have 22 minutes of error budget per month. Every incident consumes part of that budget. When it's low, we slow down."

### To Business Stakeholders

"We target 99.9% uptime for our API. That means less than 44 minutes of issues per month. We're currently at 99.94% — healthy, with budget to spare for feature work."

### To Customers (via SLA)

"We guarantee 99.9% monthly uptime. If we miss that, you receive a 10% service credit. Check our status page for real-time availability."

## Anti-Patterns

- **100% SLO** — impossible, dishonest, prevents all deployments
- **SLO without measurement** — a target you don't track is meaningless
- **SLA stricter than SLO** — you'll breach the contract before you notice internally
- **Too many SLOs** — 3-5 SLOs per service maximum. Focus on what matters.
- **SLO without error budget policy** — the budget means nothing if there are no consequences
- **Same SLO for everything** — payment processing needs higher reliability than profile photo upload
- **Never adjusting SLOs** — review and recalibrate quarterly based on actual performance and business needs

# Cost Monitoring

Cloud costs are unbounded by default. Without active monitoring, costs grow faster than revenue.

## Cost Tracking

### Tagging Strategy

Tag every cloud resource:

```yaml
tags:
  service: checkout-api
  environment: production
  team: payments
  cost-center: engineering
  managed-by: terraform
```

**Rules:**
- Enforce tags via policy (reject untagged resources)
- Use consistent naming across all providers
- Map tags to business units for chargeback

### Cost Allocation

```
Total cloud spend
├── By service (which service costs most?)
├── By environment (prod vs staging vs dev)
├── By team (who owns the spend?)
├── By resource type (compute vs storage vs network)
└── By time (trending up or down?)
```

## Budgets and Alerts

### Budget Structure

| Budget | Owner | Alert At |
|--------|-------|----------|
| Total monthly | Engineering leadership | 80%, 100%, 120% |
| Per-team | Team lead | 90%, 110% |
| Per-service | Service owner | 100%, 130% |
| Per-environment | Platform team | Staging > 20% of prod |

### Alert Configuration

```yaml
alerts:
  - name: "Monthly budget 80%"
    condition: current_spend > 0.8 * monthly_budget
    action: Slack notification to #costs

  - name: "Monthly budget exceeded"
    condition: current_spend > monthly_budget
    action: Page engineering manager

  - name: "Daily anomaly"
    condition: daily_spend > 2x * average_daily_spend
    action: Investigate immediately (possible runaway resource)

  - name: "Staging cost ratio"
    condition: staging_cost > 0.3 * production_cost
    action: Review staging resources (should be < 20% of prod)
```

## Right-Sizing

### Compute

```
Step 1: Measure actual utilization (2+ weeks of data)
Step 2: Identify over-provisioned instances
  - CPU < 20% average → downsize
  - Memory < 40% average → downsize
  - GPU < 50% average → consider spot/preemptible
Step 3: Implement changes in staging first
Step 4: Monitor for performance regression
```

### Database

- Right-size instance class based on CPU/memory utilization
- Use read replicas instead of scaling primary
- Archive old data to cheaper storage
- Review provisioned IOPS vs. actual usage

### Storage

| Storage Tier | Use For | Cost |
|-------------|---------|------|
| Hot (SSD) | Active data, recent queries | $$$ |
| Warm (HDD/Standard) | Infrequent access | $$ |
| Cold (Glacier/Archive) | Compliance, rare access | $ |

Implement lifecycle policies:
```
Objects > 30 days → move to Infrequent Access
Objects > 90 days → move to Glacier
Objects > 365 days → evaluate deletion
```

## Reserved Instances / Savings Plans

### When to Commit

- Workload is stable and predictable
- Resource will be needed for 1+ year
- Savings justify the commitment (typically 30-60% discount)

### Strategy

```
Base load (predictable, steady):    Reserved/Committed (70% of spend)
Variable load (scaling up/down):    On-demand (20% of spend)
Batch/interruptible work:           Spot/Preemptible (10% of spend)
```

### Review Schedule

- Monthly: review utilization of reserved instances
- Quarterly: adjust reservations based on growth
- Annually: renegotiate or change instance families

## Cost Optimization Quick Wins

| Action | Typical Savings | Effort |
|--------|----------------|--------|
| Delete unused resources | 10-20% | Low |
| Right-size over-provisioned | 15-30% | Medium |
| Use spot for batch jobs | 60-90% off compute | Medium |
| Reserved instances for base load | 30-60% off compute | Low |
| Storage lifecycle policies | 40-70% off storage | Low |
| Turn off dev/staging nights+weekends | 65% off non-prod | Medium |
| Review and consolidate accounts | 5-10% | High |

## Cost Review Process

### Weekly (5 minutes)

- Glance at cost dashboard
- Any anomalies this week?
- Any new resources spun up without tags?

### Monthly (30 minutes)

- Review spend vs. budget
- Top 5 cost drivers — expected?
- Cost per customer trending (unit economics)
- Unused resource audit

### Quarterly (2 hours)

- Right-sizing analysis
- Reserved instance coverage review
- Architecture optimization opportunities
- Budget adjustment for next quarter

## Unit Economics

Track cost per unit of business value:

```
Cost per request = total_compute_cost / total_requests
Cost per user = total_cost / active_users
Cost per transaction = infra_cost / transactions_processed
```

If cost per unit is increasing, something is scaling poorly.

## Anti-Patterns

- **No visibility** — can't optimize what you can't see
- **No tags** — impossible to attribute costs to services/teams
- **Over-provisioning for "just in case"** — auto-scaling exists for a reason
- **Dev environments running 24/7** — developers work 8 hours, not 24
- **Zombie resources** — load balancers with no targets, unattached volumes, unused snapshots
- **Premature optimization** — don't spend 10 hours saving $5/month
- **No budget alerts** — surprise bills are a governance failure

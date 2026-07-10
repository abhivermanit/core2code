# Runbooks

A runbook is a step-by-step guide for resolving a specific operational issue. If the on-call engineer has to think creatively at 3 AM, your runbook failed.

## Runbook Template

```markdown
# [Alert/Issue Name]

## Trigger
What condition activates this runbook (alert name, symptom, metric threshold).

## Impact
- Who is affected (all users, specific tenant, internal only)
- What is broken (specific functionality)
- Severity: P1/P2/P3

## Quick Check (< 2 minutes)
1. Is it a known issue? Check #incidents channel
2. Was there a recent deploy? Check deploy log
3. Is it a dependency? Check status pages of external services

## Diagnosis
Step-by-step investigation:

1. Check the dashboard: [link to dashboard]
2. Query for recent errors:
   ```bash
   # Example command
   kubectl logs -l app=checkout --since=5m | grep ERROR
   ```
3. Check database connectivity:
   ```bash
   psql -c "SELECT 1" $DATABASE_URL
   ```
4. Verify external dependencies:
   ```bash
   curl -s https://api.stripe.com/healthcheck
   ```

## Resolution

### If cause is: Recent deployment
1. Rollback: `kubectl rollout undo deployment/app`
2. Verify health: check dashboard returns to baseline
3. Notify in #incidents

### If cause is: Database overload
1. Check active connections: `SELECT count(*) FROM pg_stat_activity;`
2. Kill long-running queries: [link to kill query runbook]
3. If connection pool exhausted: restart application pods

### If cause is: External dependency down
1. Enable fallback/circuit breaker if available
2. Communicate to affected users via status page
3. Monitor dependency status page for updates

## Escalation
- If not resolved in 15 minutes → escalate to [team lead]
- If data loss suspected → immediately escalate to [VP Eng]
- If security breach → follow security incident procedure

## Verification
After resolution:
1. Error rate returns to baseline
2. Latency returns to baseline
3. No user-facing errors in logs
4. Run smoke test: [link to smoke test]

## Post-Resolution
1. Create incident ticket (if P1/P2)
2. Update #incidents channel with resolution
3. Schedule postmortem (if P1)
4. Update this runbook if steps were unclear or missing

## History
| Date | Trigger | Root Cause | Resolution Time |
|------|---------|-----------|-----------------|
| 2024-03-01 | Error spike | Bad deploy | 4 min (rollback) |
| 2024-02-15 | Latency spike | DB vacuum | 12 min (waited) |
```

## Runbook Standards

### Every Runbook Must Have

- **Clear trigger** — when does this apply?
- **Copy-pasteable commands** — no "figure out the right command"
- **Links to dashboards** — don't make people search
- **Escalation path** — who to call when this doesn't work
- **Verification steps** — how to confirm the fix worked
- **Time estimates** — how long should each step take?

### Writing Good Runbooks

- Write for someone who has never seen this system before
- Test the runbook by having someone unfamiliar follow it
- Include expected output for diagnostic commands
- Note common false positives and how to distinguish them
- Keep it current — outdated runbooks are dangerous

## Organization

```
runbooks/
├── services/
│   ├── api-gateway-down.md
│   ├── checkout-errors.md
│   └── payment-processing-failure.md
├── infrastructure/
│   ├── database-connection-exhaustion.md
│   ├── disk-space-critical.md
│   └── certificate-expiring.md
├── dependencies/
│   ├── stripe-outage.md
│   └── aws-degradation.md
└── security/
    ├── suspected-breach.md
    └── ddos-mitigation.md
```

### Linking to Alerts

Every alert must link to its runbook:

```yaml
alert:
  name: "Checkout Error Rate Critical"
  annotations:
    runbook_url: https://runbooks.internal/services/checkout-errors
```

## Runbook Maintenance

- **Review quarterly** — are the steps still accurate?
- **Update after every incident** — did the runbook help? What was missing?
- **Test annually** — have someone follow the runbook in staging
- **Version control** — runbooks live in git, changes are reviewed
- **Track usage** — which runbooks are used most? Are any never used?

## Anti-Patterns

- **Runbook says "investigate"** — that's not a step, it's a prayer
- **Runbook requires tribal knowledge** — if only one person can follow it, it's not a runbook
- **Outdated commands** — commands that fail because infrastructure changed
- **No escalation path** — the on-call is stuck with no way forward
- **Runbook is a wiki page nobody updates** — treat runbooks like code, with reviews and testing

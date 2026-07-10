# Rollback Strategy

Every deploy must have a rollback plan. If you can't roll back in under 5 minutes, your deployment process is incomplete.

## When to Rollback

Rollback immediately when:
- Error rate spikes above threshold (>2x baseline)
- Critical user flows are broken
- Data corruption is occurring
- Performance degradation exceeds SLO

**Do NOT rollback when:**
- A non-critical feature has a minor bug (use feature flag instead)
- A single user reports an issue (investigate first)
- Metrics are noisy but within SLO bounds

**Rule of thumb:** If you're debating whether to rollback, rollback. You can always re-deploy after investigating.

## Rollback Methods

### 1. Application Rollback

Redeploy the previous version.

```bash
# Container orchestration
kubectl rollout undo deployment/app

# Blue/green
switch_traffic(target="blue")  # previous version

# Platform
railway rollback --to <previous-deployment-id>
vercel rollback
```

**Works when:** The issue is purely in application code and the database schema hasn't changed incompatibly.

### 2. Feature Flag Rollback

Disable the problematic feature without redeploying.

```
flag: new-checkout-flow → OFF
```

**Works when:** New code is behind a flag and the feature is isolated. Fastest rollback method — seconds, not minutes.

### 3. Database Rollback

Revert a migration.

```bash
# Down migration
npx prisma migrate rollback
npx knex migrate:rollback

# Or deploy the reverse migration as a new forward migration
```

**Works when:** Migration is reversible (column additions, not deletions). Never drop columns without a prior release that stops reading them.

### 4. Infrastructure Rollback

Revert infrastructure changes.

```bash
# Terraform
terraform plan -target=<resource> # review
terraform apply -target=<resource> # from previous state

# Or revert the IaC commit and re-apply
git revert <commit> && terraform apply
```

**Works when:** Infrastructure change caused the issue (DNS, networking, scaling).

### 5. Configuration Rollback

Revert environment variables or config changes.

**Works when:** A config change (not code) caused the issue. Often overlooked as a rollback vector.

## Rollback Decision Matrix

| Symptom | Method | Time |
|---------|--------|------|
| Feature broken | Feature flag OFF | < 30s |
| App error spike | Redeploy previous version | 2-5 min |
| Migration broke queries | Down migration | 5-15 min |
| Bad config value | Revert config, restart | 1-2 min |
| Infra misconfigured | Revert IaC, re-apply | 5-30 min |

## Rollback Runbook

### Trigger
Alert fires or manual observation of degradation.

### Step 1: Confirm the issue
```
- Check error rate dashboard
- Check recent deploys (was anything deployed in last 30 min?)
- Check recent config changes
- Reproduce if possible (but don't wait long)
```

### Step 2: Decide rollback method
```
- Is it behind a feature flag? → Disable flag
- Is it a code change? → Redeploy previous version
- Is it a migration? → Evaluate reversibility
- Is it infra? → Revert IaC
```

### Step 3: Execute
```
- Announce in #incidents: "Rolling back deployment X"
- Execute the rollback
- Verify health checks pass
- Verify error rates return to baseline
- Verify critical user flows work
```

### Step 4: Communicate
```
- Update status page if customer-facing
- Notify stakeholders
- Create incident ticket
- Plan fix for the underlying issue
```

## Testing Rollbacks

You must test that rollback actually works:

1. **In staging:** After every deploy, practice rolling back
2. **Migration rollbacks:** Run down migrations in CI against a copy of production data
3. **Game days:** Quarterly, simulate a failed deploy and practice the rollback process
4. **Feature flags:** Test that disabling a flag returns users to the previous experience

## Database Rollback Challenges

Migrations that **can** be rolled back:
- Adding a nullable column
- Adding a new table
- Adding an index
- Adding a column with a default value

Migrations that **cannot** be easily rolled back:
- Dropping a column (data is gone)
- Renaming a column (old code breaks)
- Changing column type (data may not fit old type)
- Removing a table (data is gone)

**Strategy:** Make destructive migrations a two-step process:
1. Deploy code that stops using the old column
2. Wait one release cycle
3. Drop the column (point of no return, but code doesn't need it)

## Anti-Patterns

- **No rollback plan** — "we'll figure it out" is not a plan
- **Untested rollbacks** — rollback procedures that have never been exercised
- **Rollback requires the person who deployed** — anyone on-call must be able to rollback
- **Rollback takes longer than 15 minutes** — automation is missing
- **Forward-fixing under pressure** — unless it's a one-line fix you're confident about, rollback first, then fix at leisure

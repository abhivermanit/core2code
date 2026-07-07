# Deployment Strategies

Deployment should be boring. If your deploys are exciting, something is wrong with your process.

## Strategies

### Blue/Green Deployment

Two identical environments. One serves traffic (blue), one receives the new version (green). Switch traffic atomically.

```
[Load Balancer]
      │
      ├── Blue (current, serving traffic)
      │
      └── Green (new version, warming up)
```

**When to use:** You need instant rollback capability and can afford double infrastructure during deployment.

**Trade-offs:**
- Pro: Instant rollback (switch back to blue)
- Pro: Full environment testing before switch
- Con: Double infrastructure cost during deploy
- Con: Database migrations need forward/backward compatibility

### Canary Deployment

Route a small percentage of traffic to the new version. Increase gradually if metrics look good.

```
Traffic: 100% → v1
         ↓
Traffic: 95% → v1, 5% → v2
         ↓
Traffic: 75% → v1, 25% → v2
         ↓
Traffic: 0% → v1, 100% → v2
```

**When to use:** You need to validate with real traffic but limit blast radius.

**Progression:**
1. 5% for 10 minutes — check error rates
2. 25% for 30 minutes — check latency percentiles
3. 50% for 1 hour — check business metrics
4. 100% — full rollout

**Automatic rollback triggers:**
- Error rate > 1% above baseline
- p99 latency > 2x baseline
- Any 5xx spike

### Rolling Deployment

Replace instances one at a time. Simple, works with most orchestrators.

**When to use:** Standard deploys where blue/green cost is unjustified.

**Requirements:**
- Health checks must pass before next instance rolls
- Old and new versions must coexist briefly
- Connection draining for in-flight requests

### Feature Flag Deployment

Deploy code to production but activate it separately. See [feature-flags.md](./feature-flags.md).

**When to use:** Decoupling deploy from release. Ship code daily, enable features weekly.

## Zero-Downtime Requirements

1. **Database migrations are backward-compatible** — old code must work with new schema
2. **Connection draining** — in-flight requests complete before instance termination
3. **Health check endpoint** — returns 200 only when fully ready to serve
4. **Graceful shutdown** — handle SIGTERM, finish current work, close connections
5. **No breaking API changes** — use versioning, deprecation headers
6. **Warm-up period** — new instances handle traffic only after caches/connections are warm

### Graceful Shutdown Pattern

```
SIGTERM received
  → Stop accepting new connections
  → Finish in-flight requests (timeout: 30s)
  → Close database connections
  → Close message queue connections
  → Exit 0
```

## Pre-Deployment Checklist

- [ ] All CI gates pass (lint, type, test, security, build)
- [ ] Migration tested against production-like data
- [ ] Feature flags configured for new features
- [ ] Rollback plan documented and tested
- [ ] Monitoring dashboards open
- [ ] On-call engineer aware of deploy
- [ ] No other deploys in progress
- [ ] Not Friday afternoon (unless critical hotfix)

## During Deployment

- [ ] Watch error rate dashboard
- [ ] Watch latency percentiles (p50, p95, p99)
- [ ] Watch resource utilization (CPU, memory, connections)
- [ ] Check health check endpoints responding
- [ ] Verify critical user flows work

## Post-Deployment

- [ ] All instances healthy
- [ ] Error rates at or below baseline
- [ ] No degradation in latency
- [ ] Smoke tests pass
- [ ] Clean up old version resources (if blue/green)
- [ ] Update deployment log/changelog
- [ ] Notify team in deployment channel

## Database Deployment Order

Always deploy in this order for zero-downtime:

1. **Deploy migration** (additive only: new tables, new columns with defaults)
2. **Deploy application code** (uses new schema, handles old gracefully)
3. **Backfill data** (populate new columns from old)
4. **Deploy cleanup migration** (remove old columns, add constraints)

Never combine schema change and code change in one deploy.

## Anti-Patterns

- **Big bang deploys** — deploying weeks of changes at once
- **Deploy and pray** — no monitoring during rollout
- **Manual server patching** — if it's not in the pipeline, it doesn't exist
- **Shared deploy slots** — multiple services deploying simultaneously
- **Ignoring deploy frequency** — if deploys are rare, they're risky. Deploy more often, not less.

# Deployment Architecture

How the system gets from code to production, and how it runs once there.

---

## Environments

| Environment | Purpose | Data | Access | Deployment |
|-------------|---------|------|--------|-----------|
| Local | Development | Seed/mock data | Individual developer | Manual (docker-compose) |
| CI | Automated testing | Generated per run | Pipeline only | Automatic on push |
| Staging | Pre-production validation | Anonymized production copy | Engineering team | Automatic on merge to main |
| Production | Live users | Real data | Restricted (ops team) | Automatic after staging validates |

### Environment Parity

Staging must mirror production in:
- Infrastructure topology
- Service versions
- Configuration structure (different values, same keys)
- Database schema
- Feature flags (can differ in state, not in existence)

---

## Deployment Strategy

### Rolling Deployment (Default)

```
Instance 1: v1 ──── v2 (updated)
Instance 2: v1 ──── v1 ──── v2 (updated)
Instance 3: v1 ──── v1 ──── v1 ──── v2 (updated)
              ↑              ↑              ↑
           Start          In progress     Complete
```

- Update instances one at a time
- Health check must pass before proceeding to next
- Automatic rollback if health check fails
- During rollout, both versions serve traffic (must be compatible)

### Blue-Green (For major changes)

```
Blue  (v1): ████████████ ← current traffic
Green (v2): ████████████ ← idle, receiving deployment

Switch: Route all traffic Blue → Green
Verify: Monitor for 15 minutes
Teardown: Keep Blue for fast rollback (1 hour), then decommission
```

### Canary (For risky changes)

```
Stable (v1):  ████████████████████ (95% traffic)
Canary (v2):  █ (5% traffic)

Monitor canary for:
- Error rate comparison
- Latency comparison
- Business metric comparison

If healthy after 30 min: gradually increase to 25% → 50% → 100%
If unhealthy: route 100% back to stable, investigate
```

---

## Networking

### Load Balancing

```
Internet → CDN/WAF → Load Balancer → Application Instances
                          │
                          ├── Health checks (every 10s)
                          ├── Connection draining (30s on scale-down)
                          └── Sticky sessions: DISABLED (stateless apps)
```

### Health Checks

| Check | Endpoint | Frequency | Timeout | Failure Threshold |
|-------|----------|-----------|---------|------------------|
| Liveness | `GET /health/live` | 10s | 5s | 3 consecutive failures |
| Readiness | `GET /health/ready` | 10s | 5s | 1 failure removes from LB |

**Liveness** checks: Is the process running? (restart if not)
**Readiness** checks: Can this instance serve traffic? (remove from pool if not)

```typescript
// Readiness check should verify dependencies
app.get('/health/ready', async (req, res) => {
  const checks = await Promise.allSettled([
    database.ping(),
    redis.ping(),
  ]);

  const allHealthy = checks.every(c => c.status === 'fulfilled');
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'degraded',
    checks: {
      database: checks[0].status === 'fulfilled' ? 'up' : 'down',
      redis: checks[1].status === 'fulfilled' ? 'up' : 'down',
    },
  });
});
```

---

## Scaling

### Horizontal Scaling

| Metric | Scale Up | Scale Down | Min | Max |
|--------|----------|-----------|-----|-----|
| CPU utilization | > 70% for 5 min | < 30% for 15 min | 2 | 20 |
| Memory utilization | > 80% for 5 min | < 40% for 15 min | 2 | 20 |
| Request queue depth | > 100 pending | < 10 pending | 2 | 20 |
| Custom (queue jobs) | > 500 waiting | < 50 waiting | 1 | 10 |

### Scaling Rules

- Always minimum 2 instances (no single point of failure)
- Scale up fast, scale down slow (prevent flapping)
- Scale cooldown: 3 minutes up, 10 minutes down
- Pre-scale for known traffic patterns (marketing campaigns, business hours)

### Vertical Scaling Reference

| Component | Starting Size | When to Scale Up | Notes |
|-----------|--------------|-----------------|-------|
| API servers | 2 vCPU, 4GB RAM | CPU > 70% sustained | Horizontal preferred |
| Database | 4 vCPU, 16GB RAM | Query latency increasing | Vertical first, then read replicas |
| Redis | 2GB RAM | Memory > 80% | Vertical, then cluster |
| Workers | 2 vCPU, 4GB RAM | Queue depth growing | Horizontal preferred |

---

## Deployment Pipeline

```
Code Push
    │
    ▼
┌─────────────────┐
│  CI Pipeline     │
│                 │
│  1. Lint        │
│  2. Type check  │
│  3. Unit tests  │
│  4. Build       │
│  5. Integration │
│  6. Security    │
└────────┬────────┘
         │ (all pass)
         ▼
┌─────────────────┐
│  Deploy Staging  │
│                 │
│  1. Apply DB    │
│     migrations  │
│  2. Deploy app  │
│  3. Smoke tests │
│  4. E2E tests   │
└────────┬────────┘
         │ (all pass)
         ▼
┌─────────────────┐
│  Deploy Prod     │
│                 │
│  1. Apply DB    │
│     migrations  │
│  2. Canary (5%) │
│  3. Monitor     │
│  4. Full rollout│
└─────────────────┘
```

### Pipeline Timing Targets

| Stage | Target | Maximum |
|-------|--------|---------|
| Lint + type check | 1 min | 3 min |
| Unit tests | 3 min | 5 min |
| Build | 2 min | 5 min |
| Integration tests | 3 min | 10 min |
| Security scan | 2 min | 5 min |
| **Total CI** | **10 min** | **15 min** |
| Staging deploy | 5 min | 10 min |
| Staging validation | 5 min | 15 min |
| Production deploy | 10 min | 30 min |

---

## Database Migrations in Deployment

### Rules

1. Migrations run BEFORE application deployment
2. Migrations must be backward-compatible (old code works with new schema)
3. Destructive changes happen in a separate deployment (after code no longer uses old schema)
4. Migration timeout: 5 minutes maximum (alert if approaching)
5. Lock monitoring during migration (abort if locks exceed 30s)

### Safe Migration Pattern

```
Deploy 1: Add new column (nullable), deploy code that writes to both old and new
Deploy 2: Backfill new column, deploy code that reads from new
Deploy 3: Remove old column, deploy code that no longer references old
```

---

## Rollback

### Automatic Rollback Triggers

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Error rate increase | > 2x baseline | Automatic rollback |
| Latency increase (p95) | > 3x baseline | Automatic rollback |
| Health check failures | > 50% of instances | Automatic rollback |
| Memory leak | OOM on > 1 instance | Alert + manual decision |

### Rollback Procedure

1. Route traffic to previous version (immediate)
2. Investigate root cause
3. Database migrations: Forward-fix (new migration), never rollback
4. Document incident
5. Fix and redeploy through normal pipeline

---

## Secrets Management

| Secret Type | Storage | Rotation | Access |
|-------------|---------|----------|--------|
| Database credentials | Secrets manager | 90 days | Application IAM role |
| API keys (third-party) | Secrets manager | On demand | Application IAM role |
| JWT signing key | Secrets manager | 365 days (overlap old key) | Auth service only |
| Encryption keys | KMS | Annual (with re-encryption) | Specific services |
| Deploy credentials | CI/CD variables | 90 days | Pipeline only |

### Rules

- Never in source control (not even encrypted)
- Never in environment variables in Docker images
- Injected at runtime from secrets manager
- Audit log on every access
- Different secrets per environment

# Deployment

## Strategy

- Blue/Green or Canary deployment
- Zero-downtime deployments
- Database migrations run before code deployment

## Environments

| Environment | Purpose | URL | Auto-deploy |
|-------------|---------|-----|-------------|
| Development | Local development | localhost | — |
| Staging | Pre-production testing | staging.* | On merge to main |
| Production | Live traffic | app.* | Manual / after E2E pass |

## Deployment Checklist

- [ ] All CI checks pass
- [ ] Database migrations applied
- [ ] Feature flags configured
- [ ] Monitoring dashboards open
- [ ] Rollback plan confirmed
- [ ] On-call engineer aware

## Rollout Process

1. Deploy to canary (5% traffic)
2. Monitor error rate and latency for 10 minutes
3. Promote to 25% if healthy
4. Promote to 100% if healthy
5. Mark deployment complete

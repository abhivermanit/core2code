# Deployment Checklist

## Pre-Deployment

- [ ] All CI checks pass
- [ ] Code reviewed and approved
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Feature flags set correctly
- [ ] Rollback plan documented
- [ ] On-call engineer notified
- [ ] Change window confirmed

## During Deployment

- [ ] Monitoring dashboards open
- [ ] Deploy to canary/staging first
- [ ] Verify health checks pass
- [ ] Check error rates
- [ ] Check latency metrics
- [ ] Verify critical user flows

## Post-Deployment

- [ ] Error rate stable (no increase)
- [ ] Latency stable (no regression)
- [ ] No new alerts firing
- [ ] Smoke tests pass
- [ ] Status page updated (if applicable)
- [ ] Team notified of completion

## Rollback Triggers

- [ ] Error rate > 5% for 5 minutes
- [ ] P95 latency > 3x baseline
- [ ] Critical feature broken
- [ ] Health checks failing

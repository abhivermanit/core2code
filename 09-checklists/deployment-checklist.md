# Deployment Checklist

Use this checklist for every production deployment. Skip nothing.

## Pre-Deployment

### Code Readiness

- [ ] All CI checks pass (lint, type check, tests, security scan)
- [ ] Code reviewed and approved
- [ ] No merge conflicts with main
- [ ] Feature flags configured for new features
- [ ] Database migrations tested against production-like data
- [ ] Breaking changes documented and communicated

### Rollback Preparation

- [ ] Rollback procedure identified (redeploy, flag disable, migration down)
- [ ] Rollback tested in staging (at least once per release)
- [ ] Previous working version identified and accessible
- [ ] Migration is reversible (or documented as irreversible)
- [ ] Anyone on-call can execute rollback (not just deployer)

### Communication

- [ ] Team notified of upcoming deploy
- [ ] No conflicting deploys in progress
- [ ] On-call engineer aware
- [ ] Not during a known high-traffic period
- [ ] Status page updated (if maintenance expected)

### Environment

- [ ] Staging deploy successful and verified
- [ ] Staging matches production configuration
- [ ] Required secrets/config present in production
- [ ] External dependencies available (third-party APIs, services)
- [ ] Sufficient capacity for deployment (instances, connections)

## During Deployment

### Monitoring

- [ ] Error rate dashboard open and visible
- [ ] Latency dashboard (p50, p95, p99) open
- [ ] Resource utilization visible (CPU, memory, connections)
- [ ] Application logs tailing
- [ ] Health check status visible

### Progress

- [ ] Deployment progressing as expected
- [ ] Health checks passing on new instances
- [ ] No error spikes above baseline
- [ ] No latency degradation
- [ ] Connection draining working (old instances finishing requests)

### Rollback Triggers (Immediate Rollback If Any)

- [ ] Error rate > 2x baseline for 2+ minutes
- [ ] p99 latency > 3x baseline for 5+ minutes
- [ ] Health checks failing on new instances
- [ ] Data corruption detected
- [ ] Critical user flow broken (manually verified)

## Post-Deployment

### Verification (First 15 Minutes)

- [ ] All instances healthy
- [ ] Error rate at or below baseline
- [ ] Latency at or below baseline
- [ ] Critical user flows working (test manually):
  - [ ] Login/signup
  - [ ] Core feature (specific to your app)
  - [ ] Payment/checkout (if applicable)
- [ ] New feature working as expected (if applicable)
- [ ] No unexpected logs or warnings

### Stabilization (First Hour)

- [ ] Metrics stable (no slow degradation)
- [ ] No increase in support tickets
- [ ] Background jobs processing normally
- [ ] Cron jobs executing successfully
- [ ] External integrations functioning

### Cleanup

- [ ] Old version resources cleaned up (if blue/green)
- [ ] Deployment logged in changelog/deploy tracker
- [ ] Team notified of successful deploy
- [ ] Monitoring thresholds adjusted (if new features change baseline)
- [ ] Documentation updated (if behavioral changes)

## Special Considerations

### Database Migration Deploy

- [ ] Migration is additive (new columns nullable or with defaults)
- [ ] Migration runs in < 30 seconds (or uses batching)
- [ ] No exclusive table locks on large tables
- [ ] Old code works with new schema (backward compatible)
- [ ] Down migration exists and is tested

### First Deploy of New Service

- [ ] DNS configured and propagated
- [ ] SSL certificate issued and valid
- [ ] Health check endpoint implemented
- [ ] Logging configured and flowing to aggregation
- [ ] Monitoring and alerts configured
- [ ] Runbook created for common failure modes
- [ ] On-call added to alert routing

### Hotfix Deploy

- [ ] Fix is minimal (smallest possible change)
- [ ] Fix tested locally and in CI
- [ ] Root cause understood (not just symptom addressed)
- [ ] Full CI pipeline completed (no shortcuts for "urgent" fixes)
- [ ] Fix merged back to main branch after deploy

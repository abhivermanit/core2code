# Maintenance

Maintenance is not optional. Systems that aren't maintained degrade until they fail catastrophically.

## Maintenance Windows

### When to Schedule

- **Planned:** Weekly or bi-weekly, during lowest traffic period
- **Emergency:** Anytime, but with communication and approval
- **Never:** During business-critical periods (Black Friday, product launch)

### Maintenance Window Process

```
1. Announce 48+ hours in advance (internal) and 72+ hours (external)
2. Update status page: "Scheduled maintenance on [date] from [time] to [time]"
3. Prepare rollback plan for every change
4. Execute during window
5. Verify all systems healthy
6. Close maintenance window on status page
7. Send "all clear" notification
```

### During Maintenance

- One person executes, another observes
- Follow runbook step by step (no improvising)
- Document anything unexpected
- If timeline slips >50%, consider aborting and rescheduling

## Dependency Updates

### Update Cadence

| Type | Frequency | Automation |
|------|-----------|------------|
| Security patches | Immediately (within 24h for critical) | Automated PR + review |
| Minor/patch updates | Weekly | Dependabot/Renovate, batch PRs |
| Major updates | Monthly review, quarterly execution | Manual with testing |
| Runtime version (Node, Python) | Semi-annual | Manual, full regression |

### Dependency Update Process

```
1. Automated tool creates PR (Dependabot, Renovate)
2. CI runs full test suite
3. Review changelog for breaking changes
4. Merge if tests pass and changelog is clean
5. Monitor after deployment

For major updates:
6. Read migration guide
7. Update in a branch with full testing
8. Deploy to staging for 1+ week
9. Deploy to production during maintenance window
```

### Security Vulnerability Response

| Severity | Response Time | Action |
|----------|--------------|--------|
| Critical (actively exploited) | < 4 hours | Hotfix deploy |
| High (exploit available) | < 24 hours | Priority patch |
| Medium (theoretical) | < 1 week | Next sprint |
| Low (unlikely) | < 1 month | Routine update |

## Infrastructure Patching

### OS/Container Base Image Updates

- Monthly: apply OS security patches
- Quarterly: update base Docker images
- Test patches in staging for 1 week before production

### Database Maintenance

| Task | Frequency | Downtime Required |
|------|-----------|-------------------|
| VACUUM ANALYZE (Postgres) | Daily (auto) | No |
| REINDEX | Monthly | Minimal (use CONCURRENTLY) |
| Version upgrade (minor) | Quarterly | Brief (< 5 min with replicas) |
| Version upgrade (major) | Annual | Planned window |
| Connection pool tuning | As needed | No (config change) |
| Backup verification | Monthly | No |

### Cache Maintenance

- Monitor memory usage and eviction rates
- Flush stale data during off-peak (if needed)
- Update Redis/Memcached versions quarterly
- Review cache TTLs quarterly — are they still appropriate?

### Certificate Renewal

- Automate with Let's Encrypt / cert-manager
- Alert 30 days before expiry (in case automation fails)
- Test renewal process quarterly
- Document manual renewal steps for emergency

## Technical Debt Maintenance

### Allocate Time

- **20% rule:** 20% of engineering capacity goes to maintenance/tech debt
- **Dedicated sprint:** Every 6th sprint is maintenance-focused
- **Boy scout rule:** Leave code better than you found it

### Prioritize by Risk

| Priority | Criteria | Example |
|----------|----------|---------|
| Urgent | Security risk or causing incidents | Vulnerable dependency, memory leak |
| High | Blocking feature development | Outdated framework preventing new APIs |
| Medium | Causing developer friction | Slow tests, confusing code |
| Low | Cosmetic or theoretical | Code style inconsistencies |

## Monitoring Maintenance Health

Track these metrics:
- **Dependency freshness:** % of dependencies on latest minor version
- **Vulnerability count:** Open security advisories by severity
- **Build health:** CI pass rate, build time trend
- **Update velocity:** Days between update available and applied
- **Incident correlation:** Do incidents correlate with unmaintained components?

## Anti-Patterns

- **"If it ain't broke, don't fix it"** — unmaintained systems break suddenly and catastrophically
- **Maintenance backlog growing** — if updates pile up, they become too risky to apply
- **No maintenance budget** — 100% feature work means 0% reliability
- **Manual patching** — if it requires remembering, it won't happen
- **Big-bang updates** — updating everything at once instead of incrementally
- **Ignoring deprecation warnings** — they become errors in the next major version

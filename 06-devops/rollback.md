# Rollback Strategy

## When to Rollback

- Error rate exceeds threshold (> 5% for 5 minutes)
- P95 latency exceeds 3x baseline
- Critical functionality broken
- Security vulnerability discovered

## Rollback Methods

### Application Rollback

1. Revert to previous container image / build artifact
2. Deploy previous version
3. Verify health checks pass
4. Confirm error rate normalizes

### Database Rollback

1. Run down migration (if reversible)
2. If irreversible: deploy compatibility code + forward-fix
3. Never delete data without backup verification

### Feature Flag Rollback

1. Disable feature flag
2. No deployment required
3. Fastest rollback method

## Rollback Runbook

1. **Detect**: Alert fires or manual observation
2. **Decide**: Rollback vs. forward-fix (< 5 min decision)
3. **Execute**: Deploy previous version
4. **Verify**: Error rate, latency, functionality
5. **Communicate**: Status page, team notification
6. **Postmortem**: Schedule within 48 hours

## Testing Rollbacks

- Practice rollback during staging deploys
- Verify down migrations work
- Test feature flag kill switches
- Monthly rollback drill

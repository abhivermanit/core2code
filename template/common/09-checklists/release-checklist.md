# Release Checklist

A structured process for releasing software. Follow sequentially.

## Pre-Release (Planning)

- [ ] Release scope defined (which features/fixes are included)
- [ ] All included PRs merged to main
- [ ] No blocking bugs in scope
- [ ] Dependencies up to date (no known critical vulnerabilities)
- [ ] Release version determined (SemVer: major.minor.patch)
- [ ] Changelog prepared (features, fixes, breaking changes)
- [ ] Migration guide written (if breaking changes)

## Staging Validation

- [ ] Release branch/tag deployed to staging
- [ ] Full regression test suite passes
- [ ] New features manually verified in staging
- [ ] Performance benchmarks within acceptable range
- [ ] Security scan passes (no new critical/high issues)
- [ ] Database migrations applied successfully
- [ ] Rollback tested (migrate down, redeploy previous version)
- [ ] Edge cases from QA tested
- [ ] Cross-browser/device testing (if frontend)

## Release Approval

- [ ] QA sign-off (or automated test confidence)
- [ ] Product owner confirms feature completeness
- [ ] Engineering lead approves release
- [ ] No ongoing incidents that could be confused with release issues
- [ ] On-call engineer aware and available
- [ ] Release window confirmed (not Friday afternoon, not during peak)

## Production Release

- [ ] Announce release starting in #deploys channel
- [ ] Deploy to production (following deployment checklist)
- [ ] Monitor dashboards during rollout:
  - [ ] Error rate stable
  - [ ] Latency stable
  - [ ] No 5xx spikes
  - [ ] Health checks passing
- [ ] Critical user flows verified:
  - [ ] Authentication working
  - [ ] Core feature operational
  - [ ] Payments processing (if applicable)
- [ ] Feature flags enabled (if progressive rollout)

## Post-Release

### Immediate (First 30 Minutes)

- [ ] All metrics stable
- [ ] No error rate increase
- [ ] No latency degradation
- [ ] No support ticket spike
- [ ] External monitoring confirms uptime

### Same Day

- [ ] Release notes published (internal + external if applicable)
- [ ] Stakeholders notified of release
- [ ] Documentation updated (API docs, user guides)
- [ ] Changelog published
- [ ] Git tag created for release
- [ ] GitHub/GitLab release created with notes
- [ ] Marketing/comms notified (if user-facing features)

### Follow-Up (Next 48 Hours)

- [ ] Monitor for slow-burn issues (memory leaks, connection exhaustion)
- [ ] Review support tickets for release-related issues
- [ ] Verify background jobs processing correctly
- [ ] Check scheduled tasks running as expected
- [ ] Feature adoption metrics tracking
- [ ] Clean up feature flags (fully enabled = remove flag)
- [ ] Plan next release scope

## Rollback Criteria

Immediately rollback if:
- Error rate > 2x baseline for 3+ minutes
- Critical user flow broken
- Data corruption detected
- Security vulnerability introduced
- p99 latency > 5x baseline sustained

## Hotfix Release Process

When a critical issue is found post-release:

- [ ] Confirm issue severity (is it P1/P2?)
- [ ] Decide: rollback or forward-fix?
- [ ] If forward-fix: branch from release tag
- [ ] Minimal fix only (no unrelated changes)
- [ ] Full CI pipeline (no shortcuts)
- [ ] Deploy with same monitoring as regular release
- [ ] Merge fix back to main
- [ ] Update release notes

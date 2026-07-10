# Deployment Plan: [Release/Feature Name]

**Version:** [version]
**Date:** [YYYY-MM-DD]
**Deploy Lead:** [Name]
**Reviewers:** [Names]

---

## Overview

| Item | Detail |
|------|--------|
| What's deploying | [Brief description] |
| Target environment | Production |
| Deploy window | [Date, Time UTC] |
| Expected duration | [X minutes] |
| Risk level | Low / Medium / High |
| Rollback time | [X minutes] |

## Pre-Deploy Checklist

- [ ] All CI checks pass on release branch/tag
- [ ] Staging deploy verified and stable for [duration]
- [ ] Database migration tested against production-like data
- [ ] Feature flags configured (new features OFF by default)
- [ ] Rollback procedure tested in staging
- [ ] On-call engineer notified
- [ ] No conflicting deploys scheduled
- [ ] External dependencies verified (third-party APIs available)
- [ ] Team notified in #deploys channel

## Deploy Steps

### Step 1: [Description]

```bash
# Command or action
[command]
```

**Verify:** [How to confirm this step succeeded]
**Duration:** ~X minutes

### Step 2: [Description]

```bash
# Command or action
[command]
```

**Verify:** [How to confirm this step succeeded]
**Duration:** ~X minutes

### Step 3: [Description]

```bash
# Command or action
[command]
```

**Verify:** [How to confirm this step succeeded]
**Duration:** ~X minutes

## Post-Deploy Verification

- [ ] Health checks passing on all instances
- [ ] Error rate at or below baseline
- [ ] Latency (p50, p95, p99) at or below baseline
- [ ] Critical user flows working:
  - [ ] [Flow 1]
  - [ ] [Flow 2]
  - [ ] [Flow 3]
- [ ] Background jobs processing normally
- [ ] No unexpected log entries

## Rollback Plan

### Trigger Conditions (Rollback If Any)

- Error rate > [X%] for > [duration]
- p99 latency > [Xms] for > [duration]
- Critical user flow broken
- Data corruption detected

### Rollback Steps

```bash
# Step 1: [description]
[command]

# Step 2: [description]
[command]

# Step 3: Verify rollback
[command]
```

**Estimated rollback time:** [X minutes]

### Post-Rollback

- [ ] Verify all systems healthy
- [ ] Notify team
- [ ] Create incident ticket
- [ ] Schedule root cause investigation

## Communication

| When | Channel | Message |
|------|---------|---------|
| Deploy starting | #deploys | "Starting deploy of [version]" |
| Deploy complete | #deploys | "Deploy complete, monitoring" |
| Issue detected | #incidents | "Issue with deploy, investigating" |
| Rollback | #incidents | "Rolling back [version]" |
| All clear | #deploys | "Deploy successful, stable" |

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | Low/Med/High | Low/Med/High | [Plan] |

## Sign-Off

| Role | Name | Approved |
|------|------|----------|
| Deploy Lead | [Name] | [ ] |
| Engineering | [Name] | [ ] |
| QA | [Name] | [ ] |

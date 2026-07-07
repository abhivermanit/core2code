# Disaster Recovery

Disasters happen. The question isn't "if" but "when." A tested DR plan is the difference between a bad day and a company-ending event.

## Key Metrics

### RTO (Recovery Time Objective)

How long can you be down before unacceptable business impact?

```
Tier 1 (revenue-critical): RTO = 30 minutes
Tier 2 (important):        RTO = 4 hours
Tier 3 (internal tools):   RTO = 24 hours
```

### RPO (Recovery Point Objective)

How much data can you afford to lose?

```
Tier 1 (transactions, user data): RPO = 0 (no data loss)
Tier 2 (analytics, content):      RPO = 1 hour
Tier 3 (logs, derived data):      RPO = 24 hours
```

### RTO/RPO determines your architecture:

| RPO | Strategy Required |
|-----|-------------------|
| 0 | Synchronous replication, multi-region active-active |
| < 1 hour | Async replication + WAL streaming |
| < 24 hours | Daily backups + point-in-time recovery |
| > 24 hours | Daily backups |

## Disaster Scenarios

| Scenario | Probability | Impact | Recovery Strategy |
|----------|-------------|--------|-------------------|
| Single server failure | High | Low | Auto-scaling replaces instance |
| Database corruption | Medium | High | Point-in-time recovery |
| Region outage | Low | Critical | Failover to secondary region |
| Data center fire | Very low | Critical | Cross-region restore |
| Ransomware attack | Medium | Critical | Restore from immutable backups |
| Account compromise | Low | Critical | Restore from separate account |
| DNS provider outage | Low | Critical | Secondary DNS provider |

## DR Plan Structure

### 1. Detection

- How do you know a disaster is occurring?
- Automated health checks across regions
- External synthetic monitoring (from outside your infra)
- Multiple alert channels (if one is affected by the disaster)

### 2. Declaration

- Who can declare a disaster?
- What criteria trigger DR activation?
- Communication tree (who gets notified, in what order)

```
Criteria for DR activation:
- Primary region unreachable for > 15 minutes
- Data corruption detected affecting > 1% of records  
- RTO will be exceeded with normal recovery procedures
```

### 3. Failover Procedure

```markdown
## Region Failover Runbook

### Pre-Conditions
- Secondary region is warm (receiving replications)
- DNS TTL is set low (< 60 seconds)
- Application can start against replica database

### Steps
1. Confirm primary is irrecoverable (not just slow)
2. Promote database replica in secondary region
3. Update DNS to point to secondary region
4. Verify application health in secondary
5. Notify customers via status page
6. Monitor for data consistency issues

### Verification
- All critical endpoints responding
- Error rate below threshold
- Recent transactions accounted for
- No data gaps beyond RPO
```

### 4. Recovery

After the disaster is resolved:

```
1. Assess primary region status
2. Resync data from DR site back to primary
3. Verify data consistency
4. Plan failback (return to primary)
5. Execute failback during maintenance window
6. Verify normal operations
7. Postmortem on the disaster event
```

## Backup Verification

DR plans that aren't tested are fiction. See [backups.md](../06-delivery/backups.md).

### Test Schedule

| Test | Frequency | Scope |
|------|-----------|-------|
| Backup restore | Monthly | Single database to isolated env |
| Service failover | Quarterly | One service to DR region |
| Full DR drill | Annually | Complete failover, all services |
| Tabletop exercise | Quarterly | Walk through scenarios without executing |

### DR Drill Process

```
1. Schedule drill (inform stakeholders, not participants)
2. Inject failure (kill primary region, corrupt database, etc.)
3. Team executes DR plan
4. Measure: time to detect, time to recover, data loss
5. Compare to RTO/RPO targets
6. Document gaps and improvements
7. Fix issues before next drill
```

## Communication Plan

### Internal

```
T+0:   DR declared → #incident-war-room created
T+5:   All-hands notification: "DR in progress, details in #war-room"
T+15:  Status update to leadership
T+30:  Regular updates every 15 minutes
T+resolved: All-clear notification
```

### External

```
T+5:   Status page: "We are experiencing a major incident"
T+15:  Customer communication: email to affected users
T+30:  Regular status page updates
T+resolved: "Service restored" + timeline of what happened
T+48h: Detailed incident report published
```

### Communication Channels (Redundancy)

- Primary: Slack + PagerDuty
- Secondary: Email + SMS
- External: Status page + Twitter/social
- Last resort: Phone tree

## Architecture for DR

### Active-Passive (Simpler, Cheaper)

```
Region A (active): All traffic
Region B (passive): Hot standby, receiving replication

Failover: Promote B, switch traffic
Recovery: Resync A, failback
```

### Active-Active (Complex, More Resilient)

```
Region A: Serves 50% traffic
Region B: Serves 50% traffic

Failure: Remaining region absorbs all traffic
Recovery: Restore failed region, rebalance
```

### Data Replication

| Strategy | RPO | Cost | Complexity |
|----------|-----|------|------------|
| Synchronous replication | 0 | High | High |
| Async replication (< 1 min lag) | < 1 min | Medium | Medium |
| Periodic snapshots + WAL | Minutes | Low | Low |
| Daily backups | 24 hours | Lowest | Lowest |

## Anti-Patterns

- **Untested DR plan** — a plan that hasn't been drilled is a document, not a plan
- **DR in same region/account** — if the region or account is compromised, DR is too
- **Manual failover only** — 3 AM, on-call is stressed, manual steps get skipped
- **No communication plan** — customers find out from Twitter
- **DR as afterthought** — bolted on after launch = gaps everywhere
- **Assuming cloud providers don't fail** — AWS regions go down. GCP zones go down. Plan for it.
- **No failback plan** — you failed over, great. Now how do you get back?

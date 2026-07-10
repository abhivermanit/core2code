# Incident Management

Incidents are not failures — they're learning opportunities. How you handle them determines whether the same problem happens again.

## Incident Lifecycle

```
Detect → Triage → Mitigate → Resolve → Communicate → Postmortem
```

### 1. Detect

**Automated detection (preferred):**
- Alert fires based on SLO breach
- Synthetic monitoring catches failure
- Error tracking reports new exception

**Manual detection (acceptable):**
- Customer reports issue
- Team member notices something odd
- Status page of dependency shows degradation

**Goal:** Detect within 5 minutes of impact starting.

### 2. Triage

Quickly assess:
- **Who is affected?** (All users, subset, internal only)
- **What is broken?** (Core flow, secondary feature, cosmetic)
- **Is it getting worse?** (Spreading, stable, recovering)

Assign severity:

| Severity | Criteria | Example |
|----------|----------|---------|
| P1 - Critical | Core service down, data at risk | Auth broken, payments failing |
| P2 - High | Major degradation, workaround exists | Search down, can browse manually |
| P3 - Medium | Minor feature broken | Export button fails |
| P4 - Low | Cosmetic or edge case | UI glitch on one browser |

### 3. Mitigate

**Goal:** Restore service, not fix the root cause.

Mitigation options (fastest first):
1. Disable feature flag (seconds)
2. Rollback deployment (2-5 min)
3. Scale up resources (5-10 min)
4. Block abusive traffic (2-5 min)
5. Failover to backup (5-15 min)
6. Apply hotfix (15-60 min)

**Rule:** Mitigate first, investigate later. A 2-minute rollback is better than a 30-minute debug session while users suffer.

### 4. Resolve

After mitigation stabilizes the system:
- Identify root cause
- Develop permanent fix
- Test fix in staging
- Deploy fix (with proper CI/CD, no shortcuts)
- Verify fix resolves the issue

### 5. Communicate

#### Internal Communication

```
#incidents channel:
  - Incident declared: what's broken, who's affected
  - Every 15 min: status update
  - Mitigation applied: what was done
  - Resolved: confirmation and summary
```

#### External Communication (P1/P2)

```
Status page updates:
  - Investigating: "We're aware of issues with [feature]"
  - Identified: "We've identified the cause and are working on a fix"
  - Mitigated: "A fix has been applied, monitoring for stability"
  - Resolved: "The issue has been resolved. [brief explanation]"
```

**Rules:**
- Update externally within 15 minutes of detection
- Use plain language (no jargon)
- Don't over-promise ("fix within 5 minutes")
- Don't blame third parties publicly

### 6. Postmortem

See [postmortems.md](./postmortems.md) for the full template.

Schedule within 48 hours of resolution. Required for all P1 and P2 incidents.

## Roles During Incident

| Role | Responsibility |
|------|---------------|
| Incident Commander (IC) | Coordinates response, makes decisions |
| Technical Lead | Drives diagnosis and mitigation |
| Communications Lead | Updates status page and stakeholders |
| Scribe | Documents timeline in real-time |

For small teams, IC and Technical Lead can be the same person. Communications is never the same person debugging.

## Incident Commander Checklist

```
[ ] Declare incident and severity in #incidents
[ ] Assign roles (or declare you're filling multiple)
[ ] Open video call if P1 (link in channel)
[ ] Summarize what we know so far
[ ] Direct investigation efforts
[ ] Decide on mitigation approach
[ ] Approve communication to users
[ ] Declare resolved when stable
[ ] Schedule postmortem
```

## Communication Templates

### Declaring an Incident

```
🚨 INCIDENT DECLARED - P1
What: Users unable to complete checkout
Impact: All users, payments flow completely broken
IC: @engineer-name
Status: Investigating
Thread: [link]
```

### Status Update

```
📍 UPDATE - P1 Checkout Outage (25 min)
Status: Identified root cause - bad migration in deploy #1234
Action: Rolling back to previous version
ETA: 5 minutes
Impact: Still ongoing, no new orders processing
```

### Resolution

```
✅ RESOLVED - P1 Checkout Outage
Duration: 35 minutes
Root cause: Database migration locked the orders table
Mitigation: Rolled back deployment
Fix: Migration rewritten to use concurrent approach
Postmortem: Scheduled for tomorrow 2 PM
```

## Incident Metrics to Track

- **MTTD (Mean Time to Detect):** How long before we know?
- **MTTA (Mean Time to Acknowledge):** How long before someone responds?
- **MTTM (Mean Time to Mitigate):** How long before impact stops?
- **MTTR (Mean Time to Resolve):** How long before root cause is fixed?
- **Incident frequency:** Trending up or down?
- **Repeat incidents:** Same root cause appearing again?

## Anti-Patterns

- **Hero culture** — one person always saves the day (single point of failure)
- **Blame game** — "who broke it?" instead of "how did the system allow this?"
- **No communication** — users find out from Twitter, not your status page
- **Mitigation delayed by investigation** — restore service first, debug later
- **No postmortem** — same incident happens again in 3 months
- **Incident fatigue** — so many incidents that they become normalized

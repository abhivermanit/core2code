# Incident Response Plan

## Principle

When a security incident occurs, the response must be fast, coordinated, and documented. Preparation determines outcome. Practice before you need it.

---

## Incident Severity Levels

| Level | Definition | Example | Response Time |
|-------|-----------|---------|---------------|
| P1 - Critical | Active breach, data exfiltration, service completely down | Database exposed, credentials leaked publicly | Immediate (< 15 min) |
| P2 - High | Vulnerability actively exploited, significant data at risk | Auth bypass discovered, DDoS in progress | < 1 hour |
| P3 - Medium | Vulnerability discovered (not yet exploited), limited impact | Dependency CVE, misconfig found in audit | < 4 hours |
| P4 - Low | Minor security finding, no immediate risk | Informational finding, policy violation | Next business day |

---

## Phase 1: Detection

### How Incidents Are Detected

- Automated alerting (SIEM, anomaly detection)
- Dependency vulnerability scanner
- User report
- Bug bounty submission
- External notification (vendor, researcher, law enforcement)
- Routine audit

### Initial Assessment

When a potential incident is detected:

1. **Confirm** — Is this a real incident or a false positive?
2. **Classify** — What severity level?
3. **Scope** — What systems/data are affected?
4. **Escalate** — Notify the appropriate responders based on severity.

```
Detection → Confirm → Classify → Assemble team → Begin containment
              ↓ (false positive)
           Document and close
```

---

## Phase 2: Containment

Goal: Stop the bleeding. Prevent further damage without destroying evidence.

### Short-Term Containment (Minutes)

| Action | When |
|--------|------|
| Revoke compromised credentials | API keys, tokens, passwords exposed |
| Block attacking IPs | Active attack from identifiable source |
| Disable compromised accounts | Account takeover confirmed |
| Enable maintenance mode | Widespread service compromise |
| Isolate affected systems | Lateral movement detected |
| Revoke OAuth tokens | Third-party integration compromised |

### Long-Term Containment (Hours)

| Action | When |
|--------|------|
| Patch vulnerability | Root cause identified |
| Deploy WAF rules | Block attack pattern |
| Rotate all related secrets | Scope of compromise unclear |
| Rebuild affected systems | Integrity uncertain |
| Enable enhanced monitoring | Watch for follow-up attacks |

### Rules During Containment

- **Preserve evidence.** Don't wipe systems until forensics are complete.
- **Document every action** with timestamp and who performed it.
- **Communicate within the team** via secure channel (not the compromised system).
- **Don't alert the attacker** that you've detected them (if active breach).

---

## Phase 3: Eradication

Goal: Remove the attacker's access and fix the root cause.

- Identify ALL entry points used by the attacker
- Remove malware, backdoors, unauthorized accounts
- Patch the vulnerability that allowed initial access
- Verify no persistence mechanisms remain
- Rotate all credentials the attacker could have accessed
- Confirm eradication with fresh scan/audit

---

## Phase 4: Recovery

Goal: Restore normal operations safely.

### Recovery Steps

1. Restore from known-good backups (if data was modified)
2. Deploy patched systems
3. Gradually restore traffic (monitor closely)
4. Verify data integrity
5. Confirm all services operational
6. Remove temporary containment measures (IP blocks, maintenance mode)
7. Continue enhanced monitoring for 72 hours minimum

### Recovery Validation

- [ ] All affected systems patched
- [ ] All compromised credentials rotated
- [ ] No unauthorized accounts or access remain
- [ ] Data integrity confirmed
- [ ] Monitoring confirms normal behavior
- [ ] No ongoing attack indicators

---

## Phase 5: Lessons Learned

Conduct a post-incident review (blameless postmortem) within 72 hours.

### Postmortem Template

```markdown
## Incident Summary
- Date/Time: 
- Duration: 
- Severity: 
- Impact: (users affected, data exposed, downtime)

## Timeline
- HH:MM — Event description
- HH:MM — Detection method
- HH:MM — Response action
- HH:MM — Resolution

## Root Cause
What vulnerability or failure allowed this to happen?

## What Went Well
- [detection was fast, team response was coordinated, etc.]

## What Went Poorly
- [delayed detection, unclear ownership, missing runbook, etc.]

## Action Items
- [ ] [Action] — Owner — Due Date
- [ ] [Action] — Owner — Due Date

## Detection Improvements
How do we detect this faster next time?

## Prevention
How do we prevent this class of incident entirely?
```

---

## Communication

### Internal Communication

| Audience | When | Channel | Content |
|----------|------|---------|---------|
| Incident team | Immediately | Secure chat (War room) | Technical details, actions |
| Engineering leadership | P1/P2: immediately, P3: within hours | Direct message | Impact, timeline, needs |
| Company leadership | P1: immediately, P2: within hours | Exec briefing | Business impact, customer impact |
| All engineering | After containment | Internal post | What happened, what to do |

### External Communication (if user data affected)

- Legal team engaged for breach notification requirements
- Customer communication drafted (honest, factual, actionable)
- Regulatory notifications as required (GDPR: 72 hours)
- Status page updated

---

## Roles During Incident

| Role | Responsibility |
|------|---------------|
| Incident Commander | Owns the response, makes decisions, delegates |
| Technical Lead | Drives technical investigation and remediation |
| Communications Lead | Manages internal/external communications |
| Scribe | Documents everything with timestamps |
| Subject Matter Expert | Provides domain expertise as needed |

---

## Preparation (Before Incidents)

- [ ] Incident response contacts documented and accessible
- [ ] On-call rotation defined and functional
- [ ] Communication channels established (war room, secure chat)
- [ ] Runbooks for common scenarios (credential leak, DDoS, data breach)
- [ ] Regular game days / tabletop exercises (quarterly)
- [ ] Backup restoration tested (not just "we have backups")
- [ ] Legal/compliance contacts known
- [ ] Evidence collection process defined

---

## Quick Reference Card

```
1. DETECT   → Confirm it's real. Classify severity.
2. CONTAIN  → Stop the bleeding. Preserve evidence.
3. ERADICATE → Remove attacker access. Patch root cause.
4. RECOVER  → Restore safely. Monitor closely.
5. LEARN    → Postmortem within 72 hours. Improve.
```

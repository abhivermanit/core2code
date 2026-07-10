# Postmortems

Postmortems exist to prevent recurrence. If the same incident happens twice, the first postmortem failed.

## Blameless Culture

**Fundamental rule:** People don't cause incidents. Systems allow incidents to happen.

- Never assign blame to individuals
- Focus on system failures, process gaps, and missing safeguards
- Ask "what allowed this to happen?" not "who did this?"
- Treat the postmortem as a learning opportunity
- Anyone involved should feel safe to share honestly

## When to Write a Postmortem

**Required:**
- P1 incidents (any duration)
- P2 incidents lasting > 30 minutes
- Any data loss or security event
- Near-misses that could have been P1

**Optional but encouraged:**
- Interesting failure modes
- Events that required heroics to resolve
- Close calls that reveal systemic issues

## Timeline

```
Incident resolved → within 24 hours: draft timeline
                  → within 48 hours: postmortem meeting
                  → within 72 hours: published postmortem
                  → within 2 weeks: action items assigned and tracked
```

## Postmortem Template

```markdown
# Postmortem: [Incident Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** P1/P2
**Author:** [Name]
**Reviewers:** [Names]

## Summary
One paragraph: what happened, who was affected, what was the impact.

## Impact
- Users affected: [number or percentage]
- Revenue impact: [if applicable]
- Data affected: [none / X records / describe]
- Duration of impact: [from detection to resolution]

## Timeline (UTC)

| Time | Event |
|------|-------|
| 14:00 | Deploy #1234 rolled out to production |
| 14:05 | Error rate alert fires |
| 14:07 | On-call acknowledges, begins investigation |
| 14:12 | Root cause identified: migration locked orders table |
| 14:15 | Rollback initiated |
| 14:18 | Rollback complete, error rate recovering |
| 14:25 | All metrics back to baseline, incident resolved |

## Root Cause
Detailed technical explanation of what went wrong and why.

## Contributing Factors
- Factor 1: Migration wasn't tested against production data volume
- Factor 2: No timeout on migration execution
- Factor 3: Monitoring didn't detect the table lock specifically

## What Went Well
- Alert fired quickly (5 min after deploy)
- Rollback was fast and clean
- Communication was clear and timely
- No data loss occurred

## What Went Poorly
- Migration wasn't caught in staging (staging has 1% of prod data)
- No pre-deploy check for locking migrations
- Took 5 minutes to identify root cause (could be faster)

## Action Items

| Priority | Action | Owner | Due Date | Status |
|----------|--------|-------|----------|--------|
| High | Add migration lock detection to CI | @engineer1 | 2024-03-22 | TODO |
| High | Restore staging with prod-like data volume | @engineer2 | 2024-03-25 | TODO |
| Medium | Add migration execution timeout (30s) | @engineer1 | 2024-03-29 | TODO |
| Low | Document safe migration patterns | @engineer3 | 2024-04-05 | TODO |

## Lessons Learned
- Staging must reflect production data scale to catch performance issues
- Additive-only migrations should be the default pattern
- Table locks are not visible in standard error monitoring

## Prevention
What systemic changes will prevent this class of incident from recurring?
```

## Running the Postmortem Meeting

### Format (45-60 minutes)

1. **Review timeline** (10 min) — walk through what happened
2. **Identify root cause** (15 min) — use 5 Whys or fishbone diagram
3. **Discuss contributing factors** (10 min) — what made it worse?
4. **Generate action items** (15 min) — concrete, assigned, due-dated
5. **Discuss prevention** (5 min) — systemic improvements

### Rules for the Meeting

- Facilitator is NOT someone involved in the incident (neutrality)
- Everyone involved attends
- No assigning blame (redirect if it happens)
- Focus on system fixes, not individual behavior
- Document everything

## The 5 Whys

```
Why did users see errors?
  → Because the API returned 500s

Why did the API return 500s?
  → Because database queries were timing out

Why were queries timing out?
  → Because the orders table was locked

Why was the table locked?
  → Because a migration took an exclusive lock

Why did the migration take an exclusive lock?
  → Because we used ALTER TABLE without CONCURRENTLY and had no CI check for locking operations

Root cause: No automated detection of locking migrations in CI pipeline
```

## Action Item Quality

### Good Action Items

- Specific: "Add CI check that detects ALTER TABLE without CONCURRENTLY"
- Assignable: has a clear owner
- Measurable: you know when it's done
- Time-bound: has a due date
- Preventive: addresses root cause, not symptoms

### Bad Action Items

- "Be more careful" (not actionable)
- "Review code more thoroughly" (not specific)
- "Don't deploy on Fridays" (superstition, not engineering)
- "Add more monitoring" (too vague)

## Tracking Action Items

- Action items go into the same tracking system as feature work
- Tag them as `postmortem` or `reliability`
- Review completion in weekly team standup
- If action item is overdue, escalate (the incident WILL recur)
- Close the postmortem only when all high-priority items are done

## Publishing

- Published internally within 72 hours
- Accessible to entire engineering organization (transparency)
- Redact customer-specific data or security details
- Share summary with non-engineering stakeholders when impact was external

## Anti-Patterns

- **Blame-focused postmortems** — people hide information, lessons aren't learned
- **No action items** — postmortem without follow-through is documentation theater
- **Action items never completed** — same incident recurs in 3 months
- **Only the people involved write it** — outside perspective catches blind spots
- **Too much detail** — a 20-page postmortem nobody reads helps nobody
- **No postmortem for "small" incidents** — small incidents reveal big systemic issues
- **Delayed postmortems** — memory fades, lessons lose urgency

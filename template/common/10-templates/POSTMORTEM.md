# Postmortem: [Incident Title]

**Date of Incident:** [YYYY-MM-DD]
**Duration:** [X hours Y minutes]
**Severity:** P1 | P2
**Author:** [Name]
**Reviewers:** [Names]
**Status:** Draft | Review | Published

---

## Summary

[One paragraph: what happened, who was affected, how severe, how it was resolved.]

## Impact

- **Users affected:** [number or percentage]
- **Revenue impact:** [amount or "none"]
- **Data impact:** [none / X records affected / describe]
- **Duration of user-facing impact:** [time]
- **SLO budget consumed:** [X minutes of Y minute monthly budget]

## Timeline (UTC)

| Time | Event |
|------|-------|
| HH:MM | [Triggering event — deploy, config change, traffic spike] |
| HH:MM | [Detection — alert, user report, manual observation] |
| HH:MM | [First response — who, what they did] |
| HH:MM | [Key investigation steps] |
| HH:MM | [Mitigation applied] |
| HH:MM | [Service recovered] |
| HH:MM | [Incident resolved, all-clear declared] |

## Root Cause

[Detailed technical explanation. What was the single underlying cause?]

## 5 Whys

1. Why did [symptom]? → Because [cause 1]
2. Why did [cause 1]? → Because [cause 2]
3. Why did [cause 2]? → Because [cause 3]
4. Why did [cause 3]? → Because [cause 4]
5. Why did [cause 4]? → Because [root cause / systemic issue]

## Contributing Factors

- [Factor that made the incident more likely]
- [Factor that increased the blast radius]
- [Factor that delayed detection or mitigation]

## What Went Well

- [Positive aspect of the response]
- [Something that limited impact]
- [Good team coordination]

## What Went Poorly

- [What could have been better]
- [Where we were slow or confused]
- [Missing tools or processes]

## Where We Got Lucky

- [Something that could have made it worse but didn't]
- [Fortunate timing or circumstance]

## Action Items

| Priority | Action | Owner | Due Date | Ticket | Status |
|----------|--------|-------|----------|--------|--------|
| High | [Prevent recurrence] | [Name] | [Date] | [Link] | TODO |
| High | [Improve detection] | [Name] | [Date] | [Link] | TODO |
| Medium | [Reduce blast radius] | [Name] | [Date] | [Link] | TODO |
| Low | [Improve process] | [Name] | [Date] | [Link] | TODO |

## Lessons Learned

1. [Key insight that the team should internalize]
2. [Process improvement identified]
3. [Technical principle reinforced]

## Prevention

What systemic changes will prevent this entire class of incident from occurring again?

[Not just "be more careful" — concrete technical and process changes.]

---

## Appendix

### Relevant Dashboards

- [Link to dashboard showing the incident]

### Related Incidents

- [Link to similar past incidents]

### Supporting Data

[Graphs, logs, or other evidence]

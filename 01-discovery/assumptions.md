# Project Assumptions

Assumptions are things we believe to be true but have not verified. Unvalidated assumptions are the most common source of project failure. Track them explicitly.

---

## How to Use This Document

1. Document every assumption as soon as it's identified
2. Assign an owner responsible for validation
3. Set a deadline for validation
4. Update status as assumptions are confirmed or invalidated
5. When an assumption is invalidated, document the impact and required changes

---

## Assumption Register

### Technical Assumptions

| ID | Assumption | Risk if Wrong | Owner | Validate By | Status | Outcome |
|----|-----------|---------------|-------|-------------|--------|---------|
| TA-01 | Current database can handle 10x traffic growth | Architecture redesign needed | [Name] | [Date] | Unvalidated | — |
| TA-02 | Third-party API supports our required throughput | Need alternative provider or caching layer | [Name] | [Date] | Unvalidated | — |
| TA-03 | Team can ramp up on [technology] within 2 weeks | Timeline slips | [Name] | [Date] | Unvalidated | — |
| TA-04 | Existing auth system supports required features | Custom auth development needed | [Name] | [Date] | Unvalidated | — |
| TA-05 | Data migration can happen with zero downtime | Maintenance window required | [Name] | [Date] | Unvalidated | — |

### Business Assumptions

| ID | Assumption | Risk if Wrong | Owner | Validate By | Status | Outcome |
|----|-----------|---------------|-------|-------------|--------|---------|
| BA-01 | Users want [feature] based on interview data | Building wrong thing | [Name] | [Date] | Unvalidated | — |
| BA-02 | Market window is [X months] | Competitive disadvantage | [Name] | [Date] | Unvalidated | — |
| BA-03 | Pricing model is acceptable to target users | Low adoption | [Name] | [Date] | Unvalidated | — |
| BA-04 | Partner/vendor will maintain current pricing | Budget overrun | [Name] | [Date] | Unvalidated | — |

### Organizational Assumptions

| ID | Assumption | Risk if Wrong | Owner | Validate By | Status | Outcome |
|----|-----------|---------------|-------|-------------|--------|---------|
| OA-01 | Team will remain stable through project | Knowledge loss, velocity drop | [Name] | [Date] | Unvalidated | — |
| OA-02 | Stakeholder availability for decisions | Blocked work | [Name] | [Date] | Unvalidated | — |
| OA-03 | Budget approval will not be delayed | Project delayed | [Name] | [Date] | Unvalidated | — |

---

## Validation Status

| Status | Meaning |
|--------|---------|
| Unvalidated | Not yet tested or confirmed |
| In Progress | Currently being validated |
| Confirmed | Validated as true — safe to rely on |
| Invalidated | Proven wrong — action required |
| Partially True | True with caveats — document the nuance |

---

## Validation Methods

| Method | When to Use | Example |
|--------|-------------|---------|
| Prototype/Spike | Technical feasibility | "Can we integrate with API X in < 3 days?" |
| Load Test | Performance assumptions | "Can the DB handle 10k concurrent users?" |
| User Research | Behavior assumptions | "Will users understand this workflow?" |
| Vendor Confirmation | External dependency | "Does their API support bulk operations?" |
| Data Analysis | Usage patterns | "Do users actually use feature X?" |
| Legal/Compliance Review | Regulatory assumptions | "Can we store data in this region?" |

---

## Invalidated Assumptions — Impact Log

When an assumption is proven wrong, document the ripple effects:

| Assumption ID | Date Invalidated | Impact | Action Taken | New Constraints |
|--------------|-----------------|--------|--------------|-----------------|
| [TA-XX] | [Date] | [What changed] | [What we did about it] | [New limitations] |

---

## Review Cadence

- **Weekly** during active development: Review unvalidated assumptions, prioritize validation
- **Sprint planning**: Identify assumptions that block upcoming work
- **Monthly**: Full register review, archive confirmed assumptions
- **Post-mortem**: When something goes wrong, check if an invalidated assumption was the root cause

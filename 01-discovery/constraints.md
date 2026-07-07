# Project Constraints

Constraints are fixed boundaries that cannot be changed. They limit your solution space and must be respected, not challenged. Understanding constraints early prevents wasted effort.

---

## How to Use This Document

1. Identify all constraints at project start
2. Classify each by type
3. Document the source (who/what imposed this constraint)
4. Assess impact on design decisions
5. Review quarterly — constraints sometimes change

---

## Technical Constraints

| ID | Constraint | Source | Impact | Notes |
|----|-----------|--------|--------|-------|
| TC-01 | Must run on [cloud provider] | Company policy | Limits service choices | |
| TC-02 | Must integrate with [legacy system] via [protocol] | Existing infrastructure | Defines integration pattern | |
| TC-03 | Must use [language/framework] | Team capability | Limits architecture options | |
| TC-04 | Maximum [X]ms latency for critical paths | SLA commitment | Drives caching/architecture decisions | |
| TC-05 | Must support [browsers/devices] | User base | Frontend technology constraints | |
| TC-06 | Data must reside in [region] | Regulatory | Limits hosting options | |
| TC-07 | Must be backward-compatible with API v[X] | Existing clients | Constrains API design | |

---

## Budget Constraints

| ID | Constraint | Amount/Limit | Impact | Notes |
|----|-----------|-------------|--------|-------|
| BC-01 | Monthly infrastructure budget | $[X]/month | Limits compute, storage choices | |
| BC-02 | Third-party service spend | $[X]/month | Limits vendor features/tiers | |
| BC-03 | No additional headcount | [Current team size] | Constrains scope and timeline | |
| BC-04 | Software licensing | $[X] total | Limits tooling choices | |

---

## Timeline Constraints

| ID | Constraint | Deadline | Flexibility | Impact |
|----|-----------|----------|-------------|--------|
| TL-01 | Hard launch date | [Date] | None | Scope must fit timeline |
| TL-02 | Regulatory compliance deadline | [Date] | None (legal) | Priority override |
| TL-03 | Conference/event demo | [Date] | Low | Demo scope only |
| TL-04 | Contract commitment | [Date] | Low | Specific features required |
| TL-05 | Market window | [Date range] | Medium | Competitive pressure |

---

## Team Constraints

| ID | Constraint | Details | Impact | Mitigation |
|----|-----------|---------|--------|------------|
| TM-01 | Team size | [N] engineers | Limits parallelization | Prioritize ruthlessly |
| TM-02 | Skill gaps | No [X] expertise | Limits technology choices | Training or hire |
| TM-03 | Availability | Key person on leave [dates] | Blocks specific work | Plan around absence |
| TM-04 | Time zones | Team spread across [zones] | Limits sync collaboration | Async-first practices |
| TM-05 | Onboarding | [N] new hires starting [date] | Reduced velocity initially | Pair programming plan |

---

## Regulatory & Compliance Constraints

| ID | Constraint | Regulation | Impact | Verification |
|----|-----------|-----------|--------|--------------|
| RC-01 | GDPR compliance | EU data protection | Data handling, right to delete, consent | Legal review |
| RC-02 | SOC 2 Type II | Security certification | Audit logging, access controls | Annual audit |
| RC-03 | HIPAA | Health data (if applicable) | Encryption, access controls, BAAs | Compliance team |
| RC-04 | PCI DSS | Payment card data | Scope reduction, tokenization | QSA assessment |
| RC-05 | Accessibility | ADA / WCAG 2.1 AA | UI design and testing | Automated + manual |
| RC-06 | Data residency | [Country] laws | Infrastructure location | Legal + infra review |

---

## Organizational Constraints

| ID | Constraint | Source | Impact | Notes |
|----|-----------|--------|--------|-------|
| OC-01 | Must go through [review board] for architecture changes | Company process | Adds lead time to decisions | Submit early |
| OC-02 | Shared infrastructure team has [X] week lead time | Org structure | Plan infra requests ahead | |
| OC-03 | Change freeze during [period] | Business operations | No deploys during period | Plan around it |
| OC-04 | Must use approved vendor list | Procurement | Limits third-party options | Check list early |

---

## Constraint Analysis

### Impact Assessment

For each constraint, evaluate:

1. **Severity**: How much does this limit our options?
   - Low: Minor inconvenience, easy workaround
   - Medium: Meaningful limitation, requires design consideration
   - High: Fundamentally shapes the solution

2. **Permanence**: How likely is this constraint to change?
   - Permanent: Regulatory, physics, contractual
   - Long-term: Organizational, budgetary (annual cycle)
   - Short-term: Team availability, temporary technical limits

3. **Interaction**: Does this constraint conflict with other constraints?
   - Document conflicts and resolution strategy

### Constraint Conflicts

| Constraint A | Constraint B | Conflict | Resolution |
|-------------|-------------|----------|------------|
| [Timeline: launch by X] | [Quality: full test coverage] | Insufficient time | Reduce scope, not quality |
| [Budget: $X/month] | [Performance: <100ms] | May need more infra | Optimize first, then scale |

---

## Review Schedule

| Date | Reviewer | Constraints Changed | Action Taken |
|------|----------|-------------------|--------------|
| [Date] | [Name] | [None / Updated TC-03] | [Description] |

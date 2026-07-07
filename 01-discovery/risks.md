# Risk Register

Risks are things that might happen and would negatively impact the project if they do. Unlike constraints (which are certain), risks are probabilistic. Managing them means identifying them early, assessing their impact, and having a plan before they materialize.

---

## Risk Assessment Matrix

### Likelihood

| Level | Probability | Description |
|-------|------------|-------------|
| 1 - Rare | < 10% | Could happen but unlikely |
| 2 - Unlikely | 10-25% | Not expected but possible |
| 3 - Possible | 25-50% | Might happen |
| 4 - Likely | 50-75% | More likely than not |
| 5 - Almost Certain | > 75% | Expected to happen |

### Impact

| Level | Severity | Description |
|-------|----------|-------------|
| 1 - Negligible | Minimal | Minor inconvenience, easily absorbed |
| 2 - Minor | Low | Small delay or cost increase, manageable |
| 3 - Moderate | Medium | Significant delay, feature cut, or budget impact |
| 4 - Major | High | Major delivery failure, significant business impact |
| 5 - Critical | Severe | Project failure, legal/regulatory consequences |

### Risk Score

**Score = Likelihood × Impact**

| Score | Priority | Action |
|-------|----------|--------|
| 1-4 | Low | Monitor, accept |
| 5-9 | Medium | Mitigation plan required |
| 10-15 | High | Active mitigation, regular review |
| 16-25 | Critical | Immediate action, escalate to leadership |

---

## Risk Register

### Technical Risks

| ID | Risk | L | I | Score | Mitigation | Contingency | Owner | Status |
|----|------|---|---|-------|-----------|-------------|-------|--------|
| TR-01 | Third-party API becomes unreliable or deprecated | 3 | 4 | 12 | Abstract behind interface, monitor uptime | Switch to alternative provider | [Name] | Open |
| TR-02 | Performance requirements not achievable with chosen architecture | 2 | 5 | 10 | Early load testing, prototype critical path | Redesign component, add caching layer | [Name] | Open |
| TR-03 | Data migration causes data loss or corruption | 2 | 5 | 10 | Dry-run migrations, checksums, rollback plan | Restore from backup, manual reconciliation | [Name] | Open |
| TR-04 | Security vulnerability discovered post-launch | 3 | 4 | 12 | Security review, automated scanning, pen test | Incident response plan, hotfix process | [Name] | Open |
| TR-05 | Integration with [system] more complex than estimated | 4 | 3 | 12 | Spike in week 1, document API behavior | Build adapter layer, reduce integration scope | [Name] | Open |

### Schedule Risks

| ID | Risk | L | I | Score | Mitigation | Contingency | Owner | Status |
|----|------|---|---|-------|-----------|-------------|-------|--------|
| SR-01 | Scope creep extends timeline | 4 | 3 | 12 | Strict MoSCoW prioritization, change control | Cut "Should" items, extend timeline | [Name] | Open |
| SR-02 | Key team member unavailable | 2 | 4 | 8 | Knowledge sharing, documentation | Redistribute work, adjust timeline | [Name] | Open |
| SR-03 | External dependency delivers late | 3 | 4 | 12 | Regular check-ins, build with mocks | Build workaround, adjust scope | [Name] | Open |
| SR-04 | Underestimated complexity | 3 | 3 | 9 | Spike uncertain areas early, pad estimates 20% | Reduce scope to MVP, defer features | [Name] | Open |

### Business Risks

| ID | Risk | L | I | Score | Mitigation | Contingency | Owner | Status |
|----|------|---|---|-------|-----------|-------------|-------|--------|
| BR-01 | User adoption lower than projected | 3 | 4 | 12 | Beta program, user research, iterative development | Pivot approach, additional marketing, feature changes | [Name] | Open |
| BR-02 | Competitor launches similar feature first | 3 | 3 | 9 | Accelerate core differentiator, monitor market | Differentiate on quality/UX, adjust positioning | [Name] | Open |
| BR-03 | Budget constraints force trade-offs | 2 | 3 | 6 | Track burn rate weekly, early warning at 70% spend | Reduce scope, defer non-critical features | [Name] | Open |

### Operational Risks

| ID | Risk | L | I | Score | Mitigation | Contingency | Owner | Status |
|----|------|---|---|-------|-----------|-------------|-------|--------|
| OR-01 | Production incident during launch | 3 | 4 | 12 | Load test, canary deploy, runbooks ready | Rollback plan, war room process | [Name] | Open |
| OR-02 | Monitoring gaps hide problems | 2 | 4 | 8 | Observability review before launch | Retroactive alerting, manual monitoring | [Name] | Open |
| OR-03 | Disaster recovery untested | 2 | 5 | 10 | DR drill before launch | Extended recovery time, manual processes | [Name] | Open |

---

## Response Strategies

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **Avoid** | Eliminate the risk entirely | Choose a different technology to avoid the risk |
| **Mitigate** | Reduce likelihood or impact | Add automated tests to catch regressions |
| **Transfer** | Shift risk to another party | Use managed service instead of self-hosting |
| **Accept** | Risk is low enough to tolerate | Document and monitor, no active mitigation |
| **Exploit** | Turn a risk into an opportunity | If we deliver early, capture market share |

---

## Risk Review Process

### Weekly (during active development)
- Review top 5 risks by score
- Update likelihood based on new information
- Check mitigation progress
- Identify new risks

### Sprint Retrospective
- Were any risks realized?
- Were mitigations effective?
- What new risks emerged?
- Update register

### Monthly (leadership review)
- Risk register summary (critical and high only)
- Budget impact of active mitigations
- Escalation of risks requiring executive decision

---

## Closed Risks

| ID | Risk | Resolution | Date Closed | Lessons Learned |
|----|------|-----------|-------------|-----------------|
| [XX-XX] | [Description] | [How it was resolved] | [Date] | [What we learned] |

---

## Risk Triggers

Early warning signs that a risk is materializing:

| Risk ID | Trigger | Detection Method | Response |
|---------|---------|-----------------|----------|
| TR-01 | API error rate > 1% | Monitoring alert | Activate circuit breaker, notify team |
| SR-01 | 3+ unplanned items added to sprint | Sprint review | Scope discussion with product owner |
| OR-01 | Error rate spike during deploy | Canary metrics | Automatic rollback |

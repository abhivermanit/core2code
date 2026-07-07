# Test Plan: [Feature/Release Name]

**Author:** [Name]
**Date:** [YYYY-MM-DD]
**Version:** [1.0]
**Status:** Draft | Review | Approved

---

## Scope

### In Scope

- [Feature/component to test]
- [Feature/component to test]

### Out of Scope

- [What we're explicitly not testing and why]
- [What we're explicitly not testing and why]

## Test Approach

### Test Levels

| Level | Coverage | Automation | Responsible |
|-------|----------|------------|-------------|
| Unit | Business logic, utilities | 100% automated | Developer |
| Integration | API endpoints, DB queries | 90% automated | Developer |
| E2E | Critical user journeys | Key flows automated | QA/Developer |
| Manual | Exploratory, UX, edge cases | Manual | QA |

### Test Types

- [ ] Functional testing (does it work correctly?)
- [ ] Security testing (can it be exploited?)
- [ ] Performance testing (is it fast enough under load?)
- [ ] Accessibility testing (is it usable by everyone?)
- [ ] Compatibility testing (browsers, devices, OS)
- [ ] Regression testing (did we break anything existing?)

## Test Environment

| Environment | Purpose | Data |
|-------------|---------|------|
| Local | Developer testing | Seed data |
| CI | Automated test suite | Generated per run |
| Staging | Integration/E2E | Anonymized prod copy |

### Prerequisites

- [ ] Test environment configured and accessible
- [ ] Test data seeded
- [ ] External service mocks/stubs configured
- [ ] Test accounts created

## Test Cases

### [Feature Area 1]

| ID | Description | Priority | Type | Expected Result |
|----|-------------|----------|------|-----------------|
| TC-01 | [Test description] | High | Functional | [Expected outcome] |
| TC-02 | [Test description] | High | Functional | [Expected outcome] |
| TC-03 | [Edge case description] | Medium | Edge case | [Expected outcome] |

### [Feature Area 2]

| ID | Description | Priority | Type | Expected Result |
|----|-------------|----------|------|-----------------|
| TC-04 | [Test description] | High | Functional | [Expected outcome] |

### Negative/Error Cases

| ID | Description | Input | Expected Error |
|----|-------------|-------|----------------|
| TC-N1 | Invalid input | [input] | [error message/code] |
| TC-N2 | Unauthorized access | [action] | 403 Forbidden |

## Performance Criteria

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Response time (p95) | < 200ms | Load test |
| Throughput | > 100 req/s | Load test |
| Error rate under load | < 0.1% | Load test |
| Memory usage | < 512MB | Monitoring |

## Schedule

| Phase | Dates | Activities |
|-------|-------|------------|
| Test preparation | [dates] | Environment setup, test data, automation |
| Test execution | [dates] | Run tests, report defects |
| Bug fixing | [dates] | Developers fix, QA verifies |
| Regression | [dates] | Final regression pass |
| Sign-off | [date] | All criteria met |

## Entry Criteria

- [ ] Feature development complete
- [ ] Code reviewed and merged
- [ ] Unit tests passing
- [ ] Deployed to test environment
- [ ] Test data available

## Exit Criteria

- [ ] All high-priority test cases pass
- [ ] No critical or high-severity defects open
- [ ] Performance criteria met
- [ ] Security scan clean
- [ ] Test coverage targets met

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | Low/Med/High | Low/Med/High | [Plan] |

## Defect Management

| Severity | Definition | Response |
|----------|-----------|----------|
| Critical | System unusable, data loss | Fix immediately, block release |
| High | Major feature broken, no workaround | Fix before release |
| Medium | Feature impaired, workaround exists | Fix in next sprint |
| Low | Cosmetic, minor inconvenience | Backlog |

# Definition of Done

A task is not "done" until every item on this checklist is satisfied. "Works on my machine" is not done. "PR is open" is not done. Done means deployed, monitored, and validated.

---

## Code Quality

- [ ] Code is self-reviewed (read your own diff before requesting review)
- [ ] Code follows project coding standards and naming conventions
- [ ] No commented-out code, no debug statements, no TODOs without ticket numbers
- [ ] Error handling is explicit — no swallowed exceptions
- [ ] No hardcoded secrets, credentials, or environment-specific values
- [ ] Cyclomatic complexity is within acceptable limits
- [ ] No new lint warnings or type errors introduced
- [ ] Functions are focused and within length guidelines

---

## Testing

- [ ] Unit tests cover new logic (aim for >80% branch coverage on new code)
- [ ] Integration tests cover new system boundaries (DB queries, API calls)
- [ ] Edge cases and error paths are tested explicitly
- [ ] Tests are deterministic — no flaky tests introduced
- [ ] Tests run in isolation (no shared mutable state between tests)
- [ ] Test names describe the behavior being verified, not the implementation

---

## Documentation

- [ ] Public APIs have clear documentation (parameters, return values, errors)
- [ ] Complex business logic has inline comments explaining "why"
- [ ] README updated if setup or usage changed
- [ ] ADR created for significant architectural decisions
- [ ] API documentation (OpenAPI/Swagger) updated if endpoints changed
- [ ] Runbook updated if operational procedures changed

---

## Code Review

- [ ] PR has a clear description of what and why
- [ ] PR is under 400 lines of meaningful change
- [ ] At least one approval from a peer
- [ ] All review comments addressed (resolved or discussed)
- [ ] CI pipeline passes (lint, test, build, security scan)
- [ ] No merge conflicts

---

## Deployment

- [ ] Feature flag in place for incomplete or risky features
- [ ] Database migrations are backward-compatible and reversible
- [ ] Configuration changes are documented and applied
- [ ] Deployed to staging and smoke-tested
- [ ] Rollback plan exists and is documented
- [ ] No manual steps required for deployment (fully automated)

---

## Observability

- [ ] Structured logging added for key operations
- [ ] Metrics emitted for business-relevant events
- [ ] Alerts configured for failure conditions
- [ ] Health check endpoint updated if applicable
- [ ] Dashboards updated to reflect new functionality

---

## Acceptance

- [ ] Acceptance criteria from the ticket are met
- [ ] Product owner or stakeholder has validated (if applicable)
- [ ] Accessibility requirements met (WCAG 2.1 AA minimum)
- [ ] Performance within acceptable bounds (measured, not assumed)
- [ ] Security review completed for sensitive changes (auth, payments, PII)

---

## Summary

If any section above has unchecked items, the task is not done. Exceptions require explicit acknowledgment in the PR description with a follow-up ticket created.

**The bar is high because production users deserve it.**

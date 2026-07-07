# Testing Requirements

## Minimum Test Coverage

Every application must maintain:

- Unit Tests — isolated logic verification
- Integration Tests — component interaction verification
- API Tests — endpoint contract verification
- End-to-End Tests — critical user journey verification

## Security Testing

Required security test categories:

- **Authorization tests** — verify RBAC enforcement on every protected endpoint
- **RLS tests** — verify row-level security prevents cross-tenant data access
- **Injection testing** — SQL injection, XSS, command injection
- **IDOR testing** — verify changing resource IDs returns 403/404, not another user's data

## Testing Standards

- Tests must be deterministic (no flaky tests in CI)
- Tests must be independent (no ordering dependencies)
- Tests must be fast (unit tests < 10ms each)
- Mocks for external services (no network calls in unit tests)

## Regression Testing

- Required before every release
- Automated regression suite in CI
- Manual regression for critical flows (if automated coverage is insufficient)

## Coverage Targets

| Type | Target |
|------|--------|
| Unit | 80%+ |
| Integration | Critical paths covered |
| E2E | Top 10 user journeys |

## When to Write Tests

- Before fixing a bug (reproduce first)
- Alongside new features (TDD or test-after)
- After security findings (prevent recurrence)
- Before refactoring (safety net)

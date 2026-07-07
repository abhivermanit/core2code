# Security Testing

## Static Analysis

- Dependency vulnerability scanning (npm audit, Snyk)
- SAST (Static Application Security Testing)
- Secret detection in code (git-secrets, truffleHog)
- Container image scanning

## Dynamic Testing

- DAST (Dynamic Application Security Testing)
- API fuzzing
- Penetration testing (annual or per-release)

## Specific Checks

| Category | Test | Tool |
|----------|------|------|
| Dependencies | Known vulnerabilities | npm audit / Snyk |
| Secrets | Hardcoded credentials | git-secrets |
| SQL Injection | Parameterized queries | SAST + manual |
| XSS | Input sanitization | DAST + unit tests |
| CSRF | Token validation | Integration tests |
| Auth bypass | Permission checks | Integration tests |
| Rate limiting | Brute force | Load testing |

## Frequency

| Test Type | Frequency |
|-----------|-----------|
| Dependency scan | Every CI run |
| SAST | Every PR |
| Secret detection | Pre-commit hook |
| DAST | Weekly / pre-release |
| Pen test | Annually |

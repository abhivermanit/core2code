# Security Testing

## Principle

Security testing finds vulnerabilities before attackers do. It's not a one-time activity — it's layered into your development lifecycle at multiple points: commit, build, deploy, and continuously in production.

---

## Testing Categories

### SAST (Static Application Security Testing)

Analyzes source code without executing it. Finds vulnerabilities in code patterns.

**What it catches:**
- SQL injection patterns
- XSS vulnerabilities
- Hardcoded secrets
- Insecure cryptography usage
- Path traversal risks
- Unsafe deserialization

**Tools:**
| Tool | Language | Integration |
|------|----------|-------------|
| Semgrep | Multi-language | CI, IDE |
| SonarQube | Multi-language | CI, PR comments |
| CodeQL (GitHub) | Multi-language | GitHub Actions |
| Bandit | Python | CI |
| Brakeman | Ruby | CI |
| ESLint (security plugins) | JavaScript/TypeScript | IDE, CI |

**When to run:** Every PR, every commit to main.

```yaml
# CI integration
- name: SAST scan
  run: semgrep scan --config=p/owasp-top-ten --error
```

---

### DAST (Dynamic Application Security Testing)

Tests the running application from the outside, like an attacker would.

**What it catches:**
- Misconfigured headers (missing HSTS, CSP)
- Open redirects
- Server information disclosure
- Cookie security issues
- Actual injection vulnerabilities (not just patterns)

**Tools:**
| Tool | Type | Best For |
|------|------|----------|
| OWASP ZAP | Open source | CI integration, API scanning |
| Burp Suite | Commercial | Manual pen testing, automation |
| Nuclei | Open source | Template-based vulnerability scanning |

**When to run:** Against staging environment before production deploy. Weekly scans.

---

### Dependency Scanning

Identifies known vulnerabilities in third-party packages.

**What it catches:**
- CVEs in direct and transitive dependencies
- Packages with known exploits
- Outdated packages with security fixes available

**Tools:**
| Tool | Coverage |
|------|----------|
| `npm audit` / `pip-audit` / `cargo audit` | Language-specific |
| Snyk | Multi-language, deep analysis |
| Dependabot / Renovate | Automated fix PRs |
| OSV-Scanner (Google) | Multi-ecosystem |
| Trivy | Containers + dependencies |

**When to run:** Every build (CI), weekly full scan.

---

### Secret Detection

Finds accidentally committed credentials, API keys, and tokens.

**What it catches:**
- API keys (AWS, GCP, Stripe, etc.)
- Private keys
- Connection strings with passwords
- Tokens (JWT, OAuth, personal access tokens)

**Tools:**
| Tool | Integration |
|------|-------------|
| Gitleaks | Pre-commit hook, CI |
| TruffleHog | Git history scanning |
| detect-secrets (Yelp) | Pre-commit, CI |
| GitHub Secret Scanning | GitHub native |

**When to run:** Pre-commit hook + CI on every push.

```yaml
# Pre-commit hook
repos:
  - repo: https://github.com/gitleaks/gitleaks
    hooks:
      - id: gitleaks
```

---

### Penetration Testing

Manual and automated testing by security professionals who think like attackers.

**What it catches:**
- Business logic vulnerabilities
- Complex attack chains
- Social engineering vectors
- Misconfigurations that tools miss
- Authorization bypass (IDOR, privilege escalation)

**When to perform:**
- Before major feature launches
- Annually (minimum)
- After significant architecture changes
- When handling new sensitive data types

**Scope:**
- External (internet-facing) — what can an outsider reach?
- Internal (authenticated) — what can a malicious user do?
- Infrastructure — are servers, containers, cloud resources hardened?

---

## CI/CD Security Pipeline

```
Pre-commit          CI (every PR)           Pre-deploy           Continuous
─────────          ──────────────          ──────────           ──────────
Secret detection    SAST scan               DAST scan            Dependency monitoring
                   Dependency audit         Smoke security       Alert on new CVEs
                   Secret detection         tests                Weekly DAST scan
                   Container scan           Compliance check     Pen test (quarterly)
                   License compliance
```

---

## Security Test Cases to Automate

| Category | Tests |
|----------|-------|
| Authentication | Invalid tokens, expired sessions, brute force protection |
| Authorization | IDOR (access other users' data), privilege escalation |
| Input validation | SQL injection, XSS payloads, path traversal, command injection |
| Headers | HSTS, CSP, X-Content-Type-Options present and correct |
| Data exposure | Error messages don't leak internals, no debug info in prod |
| Rate limiting | Endpoints enforce limits, Retry-After returned |
| File uploads | Malicious file types rejected, size limits enforced |

```typescript
describe('Security: SQL injection prevention', () => {
  const injectionPayloads = [
    "'; DROP TABLE users; --",
    "1 OR 1=1",
    "1; SELECT * FROM users",
    "admin'--",
  ];

  injectionPayloads.forEach(payload => {
    it(`rejects injection payload: ${payload.substring(0, 20)}...`, async () => {
      const res = await api.get(`/users?search=${encodeURIComponent(payload)}`).auth(token);
      // Should not error (which would indicate the SQL executed)
      expect(res.status).not.toBe(500);
    });
  });
});
```

---

## Metrics and Reporting

| Metric | Target |
|--------|--------|
| Critical/High findings open | 0 |
| Mean time to remediate (critical) | < 48 hours |
| Mean time to remediate (high) | < 1 week |
| Dependency vulnerabilities | 0 critical, < 5 high |
| Secret detection false negative rate | 0% |
| SAST scan coverage | 100% of PRs |

---

## Anti-Patterns

- **Security testing only before release** — Too late. Shift left.
- **SAST with all rules enabled** — Thousands of false positives = noise. Tune rules.
- **Ignoring findings because "it's internal"** — Internal services get compromised too.
- **Pen test report filed and forgotten** — Track findings like bugs. Fix them.
- **"We have automated scans, we're secure"** — Tools find 30-50% of issues. Layer approaches.

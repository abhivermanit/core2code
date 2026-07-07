# Threat Model

A STRIDE-based threat model identifies potential security threats and determines appropriate mitigations. This is a living document — update it when the system architecture changes.

---

## System Overview

**System:** [System name]
**Scope:** [What's included in this threat model]
**Last Updated:** [Date]
**Reviewed By:** [Names]

### Data Flow Diagram

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│   Client     │──────▶│  API Gateway  │──────▶│  App Service  │
│  (Browser)   │◀──────│  (TLS term)   │◀──────│              │
└─────────────┘       └──────────────┘       └──────┬───────┘
                                                      │
                              ┌────────────────────────┼────────────┐
                              │                        │            │
                              ▼                        ▼            ▼
                       ┌────────────┐         ┌────────────┐  ┌─────────┐
                       │  Database   │         │   Cache     │  │ Storage │
                       └────────────┘         └────────────┘  └─────────┘
```

### Trust Boundaries

| Boundary | Between | Controls |
|----------|---------|----------|
| TB-1 | Internet ↔ API Gateway | TLS, WAF, rate limiting |
| TB-2 | API Gateway ↔ App Service | Auth token validation |
| TB-3 | App Service ↔ Database | Network isolation, credentials |
| TB-4 | App Service ↔ External APIs | TLS, API keys, circuit breakers |

---

## STRIDE Categories

| Category | Threat | Question |
|----------|--------|----------|
| **S**poofing | Identity theft | Can an attacker pretend to be someone else? |
| **T**ampering | Data modification | Can an attacker modify data in transit or at rest? |
| **R**epudiation | Denying actions | Can a user deny performing an action? |
| **I**nformation Disclosure | Data leakage | Can an attacker access data they shouldn't? |
| **D**enial of Service | Availability attack | Can an attacker make the system unavailable? |
| **E**levation of Privilege | Unauthorized access | Can an attacker gain higher privileges? |

---

## Threat Analysis

### Spoofing Threats

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation | Status |
|----|--------|-----------|-----------|--------|------|-----------|--------|
| S-1 | Stolen credentials used to impersonate user | Auth | Medium | High | High | MFA, breach detection, session binding | Mitigated |
| S-2 | Forged JWT tokens | API Gateway | Low | Critical | Medium | RSA signing, short expiry, token rotation | Mitigated |
| S-3 | API key theft from client-side code | Client | High | Medium | High | Server-side keys only, scoped permissions | Mitigated |
| S-4 | Session hijacking via XSS | Client | Medium | High | High | httpOnly cookies, CSP, XSS prevention | Mitigated |
| S-5 | Webhook spoofing (fake events from attacker) | Integration | Medium | Medium | Medium | Signature verification, IP whitelist | Mitigated |

### Tampering Threats

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation | Status |
|----|--------|-----------|-----------|--------|------|-----------|--------|
| T-1 | SQL injection modifies data | Database | Medium | Critical | High | Parameterized queries, ORM, input validation | Mitigated |
| T-2 | Man-in-the-middle modifies requests | Network | Low | High | Medium | TLS everywhere, HSTS, certificate pinning | Mitigated |
| T-3 | Unauthorized data modification via API | App Service | Medium | High | High | Authorization checks on every mutation | Mitigated |
| T-4 | Tampered file uploads (malicious content) | Storage | Medium | High | High | Virus scan, type validation, sandboxed processing | Mitigated |
| T-5 | Modified audit logs covering tracks | Database | Low | High | Medium | Append-only audit store, separate credentials | Mitigated |

### Repudiation Threats

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation | Status |
|----|--------|-----------|-----------|--------|------|-----------|--------|
| R-1 | User denies making a transaction | App Service | Medium | Medium | Medium | Audit logging, digital signatures, timestamps | Mitigated |
| R-2 | Admin denies configuration change | Admin Panel | Low | Medium | Low | Audit trail, change approval workflow | Mitigated |
| R-3 | No evidence of unauthorized access | All | Medium | High | High | Access logging, anomaly detection | Partially |

### Information Disclosure Threats

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation | Status |
|----|--------|-----------|-----------|--------|------|-----------|--------|
| I-1 | PII leaked through API over-fetching | API | Medium | High | High | Field-level authorization, response filtering | Mitigated |
| I-2 | Sensitive data in logs | Observability | High | Medium | High | Log scrubbing, no PII in logs policy | Mitigated |
| I-3 | Database backup accessed by unauthorized party | Storage | Low | Critical | Medium | Encrypted backups, separate access controls | Mitigated |
| I-4 | Error messages reveal internal details | API | Medium | Low | Low | Generic error messages in production | Mitigated |
| I-5 | Timing attacks reveal user existence | Auth | Medium | Low | Low | Constant-time comparison, same response time | Mitigated |
| I-6 | IDOR exposes other users' resources | API | Medium | High | High | Resource-level authorization on every request | Mitigated |

### Denial of Service Threats

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation | Status |
|----|--------|-----------|-----------|--------|------|-----------|--------|
| D-1 | Volumetric DDoS | API Gateway | Medium | High | High | CDN/WAF, rate limiting, auto-scaling | Mitigated |
| D-2 | Application-level DoS (expensive queries) | App Service | Medium | Medium | Medium | Query complexity limits, timeouts, pagination | Mitigated |
| D-3 | Resource exhaustion (file upload flood) | Storage | Medium | Medium | Medium | Upload size limits, rate limiting, quotas | Mitigated |
| D-4 | Database connection exhaustion | Database | Low | High | Medium | Connection pooling, limits, circuit breakers | Mitigated |
| D-5 | Regex DoS (ReDoS) | App Service | Low | Medium | Low | Regex complexity limits, timeouts, tested patterns | Mitigated |

### Elevation of Privilege Threats

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation | Status |
|----|--------|-----------|-----------|--------|------|-----------|--------|
| E-1 | IDOR: access other users' resources by guessing IDs | API | Medium | High | High | UUID IDs, authorization on every access | Mitigated |
| E-2 | Mass assignment: set admin role via API | API | Medium | Critical | High | Explicit allowlists for writable fields | Mitigated |
| E-3 | JWT manipulation to add admin claims | Auth | Low | Critical | Medium | Signature verification, server-side roles | Mitigated |
| E-4 | Container escape to host system | Infrastructure | Low | Critical | Medium | Rootless containers, security policies, updates | Mitigated |
| E-5 | Dependency vulnerability exploitation | App Service | Medium | High | High | Automated scanning, quick patching SLA | Partially |

---

## Risk Matrix

```
              Impact
         Low  Med  High Critical
    ┌─────────────────────────────┐
 5  │  M    H    H     C         │  Almost Certain
 4  │  L    M    H     H         │  Likely
 3  │  L    M    M     H         │  Possible
 2  │  L    L    M     M         │  Unlikely
 1  │  L    L    L     M         │  Rare
    └─────────────────────────────┘
         Likelihood →

L = Low (accept)    M = Medium (mitigate)
H = High (priority) C = Critical (immediate)
```

---

## Security Controls Summary

### Preventive Controls

| Control | Threats Addressed | Implementation |
|---------|------------------|---------------|
| Input validation | T-1, E-2 | Schema validation (Zod/Joi) at API boundary |
| Authentication | S-1, S-2 | JWT + refresh tokens, MFA for sensitive ops |
| Authorization | E-1, I-1, I-6 | RBAC + resource-level checks on every request |
| Encryption in transit | T-2, I-3 | TLS 1.2+ everywhere, HSTS |
| Encryption at rest | I-3 | AES-256 for database, storage |
| Rate limiting | D-1, D-2, D-3 | Per-IP and per-user limits at gateway |
| WAF | T-1, D-1 | Managed WAF rules (OWASP Top 10) |

### Detective Controls

| Control | Threats Addressed | Implementation |
|---------|------------------|---------------|
| Audit logging | R-1, R-2, R-3 | All mutations logged with actor, timestamp |
| Anomaly detection | S-1, E-3, D-1 | Baseline behavior, alert on deviation |
| Security scanning | E-5 | Automated dependency scanning in CI |
| Penetration testing | All | Annual third-party pen test |
| Log monitoring | All | SIEM with correlation rules |

### Responsive Controls

| Control | Threats Addressed | Implementation |
|---------|------------------|---------------|
| Incident response plan | All | Documented runbook, on-call rotation |
| Auto-scaling | D-1, D-2 | Scale on load, circuit break on overload |
| Automatic blocking | D-1, S-1 | Block IPs/users on threshold breach |
| Secret rotation | S-3 | Immediate rotation on suspected compromise |

---

## Attack Surface

| Surface | Exposure | Sensitivity | Priority |
|---------|----------|-------------|----------|
| Public API endpoints | Internet | High (user data) | Critical |
| Admin panel | Internal network + VPN | Critical (full control) | Critical |
| Webhook receivers | Internet (known IPs) | Medium | High |
| CI/CD pipeline | Internal | Critical (deploy access) | High |
| Database | Private subnet only | Critical (all data) | High |
| Object storage | Private (signed URLs) | Medium-High | Medium |
| Monitoring/logging | Internal | Medium (metadata) | Medium |

---

## Review Schedule

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Threat model review | Quarterly | Security team |
| Dependency scanning | Continuous (CI) | Engineering |
| Penetration testing | Annually | External vendor |
| Access review | Quarterly | Engineering + Security |
| Incident response drill | Semi-annually | On-call team |
| Security training | Annually | All engineering |

---

## Open Items

| ID | Item | Priority | Owner | Due Date | Status |
|----|------|----------|-------|----------|--------|
| [1] | [Security concern to address] | [Priority] | [Name] | [Date] | Open |

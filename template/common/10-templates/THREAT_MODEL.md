# Threat Model: [System/Feature Name]

**Author:** [Name]
**Date:** [YYYY-MM-DD]
**Status:** Draft | Review | Approved
**Last Review:** [YYYY-MM-DD]

---

## System Overview

### Description

Brief description of the system being modeled.

### Architecture Diagram

```
[External users] → [Load Balancer] → [API] → [Database]
                                           → [Cache]
                                           → [External Service]
```

### Assets (What Are We Protecting?)

| Asset | Sensitivity | Location |
|-------|-------------|----------|
| User credentials | Critical | Database (encrypted) |
| PII (emails, names) | High | Database |
| Payment data | Critical | Payment provider (tokenized) |
| Session tokens | High | Redis, browser cookies |
| API keys | Critical | Secret manager |
| Business data | Medium | Database |

### Trust Boundaries

```
[Untrusted] Internet / Browser
─────────── Trust Boundary 1 ───────────
[Semi-trusted] API Gateway / Load Balancer
─────────── Trust Boundary 2 ───────────
[Trusted] Internal services
─────────── Trust Boundary 3 ───────────
[Highly trusted] Database / Secret store
```

## STRIDE Analysis

### Spoofing (Impersonating someone/something)

| Threat | Component | Risk | Mitigation |
|--------|-----------|------|------------|
| Attacker impersonates user | Auth endpoint | High | MFA, account lockout, session management |
| Stolen API key used | API | High | Key rotation, scoping, monitoring |
| Forged JWT | All endpoints | High | Signature verification, short expiry |

### Tampering (Modifying data or code)

| Threat | Component | Risk | Mitigation |
|--------|-----------|------|------------|
| Request body modification | API | Medium | Input validation, integrity checks |
| Database record modification | Database | High | Access control, audit log, checksums |
| Man-in-the-middle | Network | High | TLS everywhere, certificate pinning |

### Repudiation (Denying actions)

| Threat | Component | Risk | Mitigation |
|--------|-----------|------|------------|
| User denies action | Application | Medium | Audit logging, immutable records |
| Admin denies change | Admin panel | High | Comprehensive audit trail |
| Transaction disputed | Payments | High | Transaction records, receipts |

### Information Disclosure (Exposing data)

| Threat | Component | Risk | Mitigation |
|--------|-----------|------|------------|
| Database breach | Database | Critical | Encryption at rest, access controls |
| Error messages leak info | API | Medium | Generic errors externally, detailed internally |
| Logs contain sensitive data | Logging | High | Log scrubbing, no PII in logs |
| Backup exposure | Storage | High | Encrypted backups, access controls |

### Denial of Service (Making system unavailable)

| Threat | Component | Risk | Mitigation |
|--------|-----------|------|------------|
| DDoS attack | API Gateway | High | WAF, rate limiting, CDN |
| Resource exhaustion | API | Medium | Rate limiting, request size limits |
| Database overload | Database | High | Connection pooling, query limits |
| Algorithmic complexity | Search/sort | Medium | Input limits, timeout |

### Elevation of Privilege (Gaining unauthorized access)

| Threat | Component | Risk | Mitigation |
|--------|-----------|------|------------|
| Privilege escalation via IDOR | API | High | Authorization checks on every resource |
| Cross-tenant data access | Multi-tenant | Critical | RLS, tenant isolation |
| Admin function access | Admin panel | Critical | Role enforcement, additional auth |
| SQL injection | Database queries | Critical | Parameterized queries |

## Risk Assessment

### Risk Matrix

| Likelihood → | Low | Medium | High |
|---|---|---|---|
| **Impact ↓ Critical** | Medium | High | Critical |
| **Impact ↓ High** | Low | Medium | High |
| **Impact ↓ Medium** | Low | Low | Medium |

### Prioritized Risks

| # | Threat | Risk Level | Status |
|---|--------|-----------|--------|
| 1 | SQL injection | Critical | Mitigated (parameterized queries) |
| 2 | Cross-tenant data access | Critical | Mitigated (RLS) |
| 3 | Credential stuffing | High | Mitigated (rate limiting, MFA) |
| 4 | Session hijacking | High | Mitigated (secure cookies, rotation) |
| 5 | DDoS | High | Partially mitigated (CDN, rate limits) |

## Mitigations Summary

### Implemented

- [ ] TLS 1.3 for all connections
- [ ] Input validation on all endpoints
- [ ] Parameterized queries (no SQL injection)
- [ ] Rate limiting (per-user and per-IP)
- [ ] Session management (expiry, rotation, revocation)
- [ ] Audit logging for sensitive operations
- [ ] Row-level security for tenant isolation
- [ ] Secrets in secret manager (not code/env)

### Planned

- [ ] [Mitigation] — Target date: [date]
- [ ] [Mitigation] — Target date: [date]

### Accepted Risks

| Risk | Reason for Acceptance | Review Date |
|------|----------------------|-------------|
| [Risk] | [Why we accept it] | [When to reassess] |

## Attack Scenarios

### Scenario 1: [Name]

**Attacker:** [Who]
**Goal:** [What they want]
**Steps:**
1. [Step]
2. [Step]
3. [Step]

**Detection:** [How we'd notice]
**Response:** [What we'd do]

## Review Schedule

- Quarterly review of threat model
- Review triggered by: architecture changes, new features, incidents
- Next review: [date]

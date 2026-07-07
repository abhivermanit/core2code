# OWASP Top 10

## Principle

The OWASP Top 10 represents the most critical web application security risks. Every developer should understand these — not just security engineers. This guide covers each risk with practical prevention.

---

## 1. Broken Access Control

**What:** Users acting outside their intended permissions — accessing other users' data, modifying records they don't own, escalating privileges.

**Prevention:**
- Default deny. Require explicit grants for every endpoint.
- Enforce access control server-side. Never rely on client-side checks.
- Validate object ownership on every request (`WHERE user_id = ?` on all queries).
- Disable directory listing. Prevent direct access to file IDs.
- Log and alert on access control failures.
- Rate limit API access to minimize automated attack damage.

```typescript
// Always verify ownership
async function getOrder(orderId: string, userId: string) {
  const order = await db.orders.findOne({ id: orderId, userId });
  if (!order) throw new NotFoundError(); // Not "Forbidden" — don't leak existence
  return order;
}
```

---

## 2. Cryptographic Failures

**What:** Exposure of sensitive data due to weak or missing encryption — plaintext storage, weak algorithms, exposed keys.

**Prevention:**
- Encrypt data in transit (TLS 1.2+) and at rest.
- Never store passwords in plaintext. Use bcrypt/argon2 with salt.
- Don't use MD5, SHA-1, or DES. Use SHA-256+, AES-256-GCM.
- Don't roll your own crypto. Use vetted libraries.
- Classify data by sensitivity. Apply encryption accordingly.
- Rotate keys regularly. Have a revocation plan.

---

## 3. Injection

**What:** Untrusted data sent to an interpreter — SQL injection, NoSQL injection, OS command injection, LDAP injection.

**Prevention:**
- Use parameterized queries (prepared statements) for all database access.
- Use ORM/query builders that parameterize by default.
- Validate and sanitize all input. Use allowlists, not denylists.
- Escape output appropriate to context (HTML, SQL, OS).
- Never concatenate user input into queries or commands.

```typescript
// BAD
const query = `SELECT * FROM users WHERE email = '${email}'`;

// GOOD
const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
```

---

## 4. Insecure Design

**What:** Missing or ineffective security controls that stem from design flaws, not implementation bugs. No amount of code fixes can patch a bad design.

**Prevention:**
- Threat model during design, not after implementation.
- Define security requirements per user story (who, what, when, why).
- Use secure design patterns (least privilege, defense in depth).
- Establish a paved road — make the secure path the easy path.
- Write abuse cases alongside use cases.

---

## 5. Security Misconfiguration

**What:** Insecure default configs, incomplete setup, open cloud storage, verbose error messages, unnecessary features enabled.

**Prevention:**
- Harden all environments (dev, staging, prod). No default credentials.
- Remove unused features, frameworks, and endpoints.
- Automate config verification in CI/CD.
- Disable stack traces and detailed errors in production.
- Review cloud permissions (S3 buckets, security groups) regularly.
- Keep all software and dependencies patched.

---

## 6. Vulnerable and Outdated Components

**What:** Running components (frameworks, libraries, OS) with known vulnerabilities. Includes not knowing what versions you're running.

**Prevention:**
- Maintain a software bill of materials (SBOM).
- Automated scanning in CI (`npm audit`, `snyk`, `dependabot`).
- Remove unused dependencies.
- Pin versions. Review and update regularly.
- Subscribe to security advisories for critical dependencies.
- See `dependency-security.md` for full policy.

---

## 7. Identification and Authentication Failures

**What:** Weak auth implementation — credential stuffing, weak passwords, missing MFA, session fixation, exposed session IDs.

**Prevention:**
- Use a managed auth provider (not custom implementations).
- Enforce MFA for sensitive operations.
- Don't ship with default credentials.
- Rate limit and lock accounts after failed attempts.
- Use secure session management (see `session-management.md`).
- Invalidate sessions on password change.
- Check passwords against breach databases (HaveIBeenPwned API).

---

## 8. Software and Data Integrity Failures

**What:** Code and infrastructure that doesn't verify integrity — insecure CI/CD pipelines, auto-updates without verification, tampered dependencies.

**Prevention:**
- Verify all downloads and dependencies (checksums, signatures).
- Secure CI/CD pipelines (least privilege, signed commits).
- Use lock files and verify integrity hashes.
- Review code changes before deployment (no auto-deploy from PRs).
- Implement signed artifacts for deployment.

---

## 9. Security Logging and Monitoring Failures

**What:** Insufficient logging, detection, and response — breaches go unnoticed, no alerting, logs insufficient for forensics.

**Prevention:**
- Log all authentication events (success and failure).
- Log access control failures.
- Log input validation failures.
- Ensure logs have context (who, what, when, from where).
- Set up alerting for anomalous patterns.
- Test that your monitoring detects simulated attacks.
- See `audit-logging.md` for implementation details.

---

## 10. Server-Side Request Forgery (SSRF)

**What:** Application fetches a remote resource based on user-supplied URL without validation — accessing internal services, cloud metadata, file systems.

**Prevention:**
- Validate and sanitize all user-supplied URLs.
- Use allowlists for permitted domains/IPs.
- Block requests to internal network ranges (10.x, 172.16.x, 192.168.x, 169.254.x).
- Don't send raw responses from internal requests back to the user.
- Disable HTTP redirects or validate redirect targets.

```typescript
// Validate URL before fetching
function isAllowedUrl(url: string): boolean {
  const parsed = new URL(url);
  const blockedRanges = ['10.', '172.16.', '192.168.', '169.254.', 'localhost', '127.'];
  return !blockedRanges.some(range => parsed.hostname.startsWith(range));
}
```

---

## Quick Reference

| # | Risk | Key Control |
|---|------|------------|
| 1 | Broken Access Control | Server-side enforcement, ownership checks |
| 2 | Cryptographic Failures | TLS + proper algorithms + key management |
| 3 | Injection | Parameterized queries, input validation |
| 4 | Insecure Design | Threat modeling, secure patterns |
| 5 | Security Misconfiguration | Hardening, automation, defaults review |
| 6 | Vulnerable Components | Scanning, updating, SBOM |
| 7 | Auth Failures | Managed providers, MFA, rate limiting |
| 8 | Integrity Failures | Signatures, verified pipelines |
| 9 | Logging Failures | Comprehensive logging, alerting |
| 10 | SSRF | URL validation, allowlists, network segmentation |

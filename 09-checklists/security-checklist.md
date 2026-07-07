# Security Checklist

Security is not a feature. It's a property of every feature. Review this checklist for every significant change.

## Authentication

- [ ] Passwords hashed with bcrypt/argon2 (never MD5, SHA)
- [ ] Minimum password length enforced (12+ characters)
- [ ] Account lockout after failed attempts (5 attempts, 15-min lockout)
- [ ] Multi-factor authentication available (TOTP, WebAuthn)
- [ ] Session tokens are cryptographically random (256-bit minimum)
- [ ] Sessions expire (idle timeout: 30 min, absolute: 24h)
- [ ] Session invalidation on password change
- [ ] Logout actually invalidates the session (server-side)
- [ ] OAuth state parameter validated (CSRF protection)
- [ ] Token refresh doesn't extend beyond original session limit

## Authorization

- [ ] Every endpoint checks authorization (not just authentication)
- [ ] Authorization checked server-side (never rely on client-side hiding)
- [ ] Row-level security prevents cross-tenant data access
- [ ] ID enumeration doesn't leak data (use UUIDs, not sequential IDs)
- [ ] File access controlled (can't access other users' uploads via URL)
- [ ] Admin functions require explicit admin role check
- [ ] API keys have scoped permissions (not full access)
- [ ] Principle of least privilege applied to all service accounts

## Input Validation

- [ ] All user input validated server-side (type, length, format)
- [ ] SQL injection prevented (parameterized queries, never string concat)
- [ ] XSS prevented (output encoding, CSP headers)
- [ ] Path traversal prevented (don't use user input in file paths)
- [ ] Command injection prevented (no shell exec with user input)
- [ ] File upload validated (type, size, content inspection, not just extension)
- [ ] Redirect URLs validated (prevent open redirect)
- [ ] JSON/XML parsing limits set (prevent billion laughs, deep nesting)
- [ ] Rate limiting on all public endpoints

## Data Protection

- [ ] PII identified and documented
- [ ] Data encrypted at rest (database, backups, file storage)
- [ ] Data encrypted in transit (TLS 1.2+ everywhere)
- [ ] Sensitive data not logged (passwords, tokens, card numbers)
- [ ] Sensitive data not cached in browser (Cache-Control headers)
- [ ] Data retention policy implemented (auto-delete expired data)
- [ ] Data export capability (GDPR right of access)
- [ ] Data deletion capability (GDPR right to erasure)
- [ ] Backups encrypted with separate key from production

## API Security

- [ ] Authentication required on all non-public endpoints
- [ ] Rate limiting per user/IP/API key
- [ ] Request size limits enforced
- [ ] CORS properly configured (not wildcard *)
- [ ] API versioning to prevent breaking changes
- [ ] Error responses don't leak internal details
- [ ] Webhook signatures verified (HMAC)
- [ ] GraphQL depth/complexity limits (if applicable)
- [ ] File downloads validated (content-disposition, MIME type)

## Infrastructure

- [ ] Secrets stored in secret manager (not env files, not git)
- [ ] Secret rotation policy established
- [ ] Network segmentation (DB not publicly accessible)
- [ ] Firewall rules follow least privilege
- [ ] SSH access restricted and key-based only
- [ ] Container images scanned for vulnerabilities
- [ ] Base images from trusted sources, pinned versions
- [ ] Infrastructure as code (auditable, reviewable changes)
- [ ] No default credentials on any service

## Dependencies

- [ ] Dependencies from trusted sources only
- [ ] Lock files committed (reproducible builds)
- [ ] Automated vulnerability scanning (Snyk, npm audit)
- [ ] Critical vulnerabilities patched within 24 hours
- [ ] Unused dependencies removed
- [ ] No dependency with known malicious behavior
- [ ] Sub-dependency tree reviewed for suspicious packages

## Headers and Configuration

- [ ] Strict-Transport-Security (HSTS) enabled
- [ ] Content-Security-Policy (CSP) configured
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY (or SAMEORIGIN)
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configured (limit browser features)
- [ ] Server header removed (don't advertise technology)
- [ ] Debug mode disabled in production

## Operational Security

- [ ] Audit log records all sensitive operations
- [ ] Admin actions require additional authentication step
- [ ] Alerts for suspicious activity (failed logins, privilege escalation)
- [ ] Incident response plan documented
- [ ] Security contact published (security.txt)
- [ ] Responsible disclosure program available
- [ ] Regular security reviews scheduled
- [ ] Team trained on secure coding practices

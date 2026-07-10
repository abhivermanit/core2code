# Authentication Checklist

## Principle

Never build authentication from scratch. Use a managed provider, enforce MFA, and assume credentials will be stolen — design for that inevitability.

---

## Implementation Checklist

### Provider Selection

- [ ] Use a managed auth provider (Auth0, Clerk, Supabase Auth, AWS Cognito, Firebase Auth)
- [ ] Never implement custom password hashing, token generation, or session management
- [ ] Provider supports MFA, passwordless, and social login out of the box
- [ ] Provider has SOC 2 / ISO 27001 compliance
- [ ] Evaluate provider's breach history and incident response

### Password Policy (if passwords are required)

- [ ] Minimum 12 characters (NIST 800-63B recommendation)
- [ ] No maximum length below 64 characters
- [ ] No composition rules (uppercase + special char is outdated)
- [ ] Check against breached password databases (HaveIBeenPwned API)
- [ ] Hash with bcrypt (cost factor 12+) or argon2id
- [ ] Never store plaintext or reversibly encrypted passwords
- [ ] Rate limit login attempts (5 failures → progressive delay)

### Multi-Factor Authentication

- [ ] MFA available for all users
- [ ] MFA required for admin accounts and sensitive operations
- [ ] Support TOTP (authenticator apps) as primary
- [ ] Support WebAuthn/passkeys as preferred method
- [ ] SMS-based MFA only as last resort (SIM-swapping risk)
- [ ] Recovery codes generated and stored securely
- [ ] MFA bypass requires identity verification process

### Session Management

- [ ] Sessions have a defined timeout (idle: 30 min, absolute: 24 hours)
- [ ] Sessions invalidated on password change
- [ ] Sessions invalidated on privilege escalation
- [ ] Session tokens are opaque (not JWTs for session state)
- [ ] Concurrent session limit (alert on unusual session count)
- [ ] See `session-management.md` for full details

### Token Handling

- [ ] Access tokens are short-lived (5-15 minutes)
- [ ] Refresh tokens rotate on use (one-time use)
- [ ] Refresh tokens have absolute expiration (7-30 days)
- [ ] Revoke all tokens on password reset
- [ ] Tokens stored securely (httpOnly cookies, not localStorage)
- [ ] Token rotation detects reuse (revoke family on replay)

### Login Flow

- [ ] Uniform response for valid/invalid credentials ("Invalid email or password")
- [ ] No user enumeration through login, registration, or password reset
- [ ] CAPTCHA or proof-of-work after repeated failures
- [ ] Account lockout after 10 failures (with notification to user)
- [ ] Login notifications for new devices/locations
- [ ] Step-up authentication for sensitive operations

### Password Reset

- [ ] Reset tokens are single-use and expire in 15-30 minutes
- [ ] Reset links use cryptographically random tokens (≥ 32 bytes)
- [ ] Old password not required (user may have forgotten it)
- [ ] Invalidate all active sessions after password reset
- [ ] Notify user via email when password is changed
- [ ] Rate limit password reset requests

### Registration

- [ ] Email verification required before full access
- [ ] Verification links expire in 24 hours
- [ ] Prevent account enumeration (same response for existing/new emails)
- [ ] Bot protection on registration endpoint
- [ ] Validate email format and deliverability

### Logout

- [ ] Invalidate session server-side (not just client-side token removal)
- [ ] Clear all auth cookies with proper flags
- [ ] "Logout everywhere" option available
- [ ] Revoke refresh tokens on logout

---

## What NOT to Do

| Anti-Pattern | Risk |
|-------------|------|
| Custom password hashing | You'll get it wrong. Use bcrypt/argon2. |
| Storing passwords in plaintext or reversible encryption | Instant breach of all accounts |
| JWTs as session tokens with long expiry | Can't revoke, can't invalidate |
| Security questions ("mother's maiden name") | Easily guessable/researchable |
| SMS-only MFA | SIM-swap attacks |
| Email-based OTP with long expiry | Email compromised = account compromised |
| "Remember me" without session limits | Infinite sessions are an attacker's friend |
| Different error messages for valid/invalid email | User enumeration |

---

## Monitoring

- Alert on: 10+ failed logins from one IP in 5 minutes
- Alert on: Login from a new country
- Alert on: Password reset followed by immediate login from different IP
- Alert on: Bulk account creation from one IP
- Alert on: Admin account login outside business hours
- Log all auth events (success and failure) with context

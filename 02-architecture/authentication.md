# Authentication Architecture

How users prove their identity. Authentication answers "who are you?" — authorization (separate document) answers "what can you do?"

---

## Provider Selection

### Decision Criteria

| Criterion | Build Custom | Auth-as-a-Service | Self-Hosted OSS |
|-----------|-------------|-------------------|-----------------|
| Time to market | Weeks/months | Days | Days/weeks |
| Customization | Full control | Limited | Moderate |
| Compliance control | Full | Shared responsibility | Full |
| Operational burden | High | Low | Medium |
| Cost at scale | Predictable | Usage-based (can spike) | Infrastructure cost |
| Vendor lock-in | None | High | Low |

### Recommendations

- **Most projects:** Use a managed auth service (Auth0, Clerk, AWS Cognito, Firebase Auth)
- **Regulated industries:** Self-hosted solution (Keycloak, Ory) or build custom
- **Simple internal tools:** Basic session auth may suffice

### Provider Evaluation Checklist

- [ ] Supports required auth methods (password, social, SSO, MFA)
- [ ] SDK available for your tech stack
- [ ] Pricing predictable at your scale
- [ ] Data residency meets compliance requirements
- [ ] SLA meets availability requirements
- [ ] Migration path exists (can export users)
- [ ] Customizable login UI (or headless mode)

---

## Session Management

### Strategy Options

| Strategy | Best For | Trade-offs |
|----------|----------|-----------|
| JWT (stateless) | Microservices, API-first | Can't revoke instantly, larger payload |
| Opaque tokens + server-side session | Monoliths, web apps | Requires session store, but fully revocable |
| JWT + refresh token | Balance of both | More complex, good security profile |

### Recommended: JWT Access + Opaque Refresh

```
┌─────────┐         ┌─────────┐         ┌──────────────┐
│  Client  │         │   API    │         │  Token Store  │
└────┬────┘         └────┬────┘         └──────┬───────┘
     │                    │                      │
     │ Login              │                      │
     │───────────────────▶│                      │
     │                    │  Store refresh token  │
     │                    │─────────────────────▶│
     │  {access, refresh} │                      │
     │◀───────────────────│                      │
     │                    │                      │
     │ API Request        │                      │
     │ (access token)     │                      │
     │───────────────────▶│                      │
     │   Response         │ (verify JWT locally) │
     │◀───────────────────│                      │
     │                    │                      │
     │ Refresh            │                      │
     │ (refresh token)    │                      │
     │───────────────────▶│                      │
     │                    │  Validate + rotate    │
     │                    │─────────────────────▶│
     │  {new access,      │                      │
     │   new refresh}     │                      │
     │◀───────────────────│                      │
```

### Session Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Access token TTL | 15 minutes | Short-lived, limits exposure if stolen |
| Refresh token TTL | 7 days (web), 30 days (mobile) | Balance UX vs security |
| Refresh token rotation | On every use | Detect theft (old token used = compromise) |
| Concurrent sessions | Max 5 per user | Limit exposure surface |
| Session idle timeout | 30 minutes | Web apps; not applicable for mobile |
| Absolute session timeout | 12 hours | Forces re-authentication |

### Session Storage

- **Access tokens:** Not stored server-side (stateless JWT, verified by signature)
- **Refresh tokens:** Stored hashed in database/Redis with metadata
- **Session metadata:** User agent, IP, last activity, creation time

---

## Token Lifecycle

### Token Generation

```
Access Token (JWT):
{
  "sub": "usr_abc123",
  "iss": "https://auth.example.com",
  "aud": "https://api.example.com",
  "exp": 1705312200,      // 15 min from now
  "iat": 1705311300,
  "roles": ["user"],
  "permissions": ["read:own_profile", "write:own_profile"]
}
```

### Token Validation Checklist

For every request:
1. Token present in Authorization header
2. Signature valid (using public key / shared secret)
3. Not expired (`exp` > now)
4. Issuer matches expected (`iss`)
5. Audience matches this service (`aud`)
6. Token not in revocation list (for critical operations)

### Token Revocation

| Scenario | Action |
|----------|--------|
| User logs out | Revoke refresh token, access token expires naturally |
| Password change | Revoke all refresh tokens for user |
| Account compromise | Revoke all tokens, force re-authentication |
| Permission change | Wait for access token expiry (15 min max) or force refresh |
| Admin action | Revoke all tokens for target user |

### Revocation Implementation

- **Refresh tokens:** Delete from store (immediate)
- **Access tokens (when immediate revocation needed):** Short blocklist in Redis with TTL matching token expiry
- **Global revocation:** Increment user's `tokenVersion`; reject tokens with old version

---

## Multi-Factor Authentication (MFA)

### Supported Methods (in order of security)

| Method | Security Level | UX Friction | Recommended For |
|--------|---------------|-------------|-----------------|
| Hardware key (FIDO2/WebAuthn) | Highest | Low (once set up) | High-security accounts |
| Authenticator app (TOTP) | High | Medium | All users |
| SMS OTP | Medium | Medium | Fallback only |
| Email OTP | Medium | High | Fallback only |

### MFA Flow

```
1. User completes primary authentication (password)
2. System checks if MFA is required/enrolled
3. System challenges with enrolled MFA method
4. User provides MFA response
5. System verifies and issues full session tokens
```

### MFA Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| Required for | Admin users, sensitive operations | Mandatory for elevated privileges |
| Optional for | All users | Encouraged, not enforced |
| Recovery codes | 10 single-use codes | Generated at enrollment |
| Remember device | 30 days | Skip MFA on trusted devices |
| Step-up auth | For sensitive operations | Re-verify even within session |

### Step-Up Authentication

For sensitive operations (changing email, deleting account, financial actions):
- Require re-authentication regardless of session state
- Short-lived elevated session (5 minutes)
- Always require MFA if enrolled

---

## Security Considerations

### Password Requirements

| Rule | Value |
|------|-------|
| Minimum length | 12 characters |
| Maximum length | 128 characters |
| Complexity | No arbitrary rules (uppercase, special char); check against breach databases |
| Hashing | Argon2id (preferred) or bcrypt (cost 12+) |
| Breach check | Check against HaveIBeenPwned on registration and login |

### Brute Force Protection

| Mechanism | Threshold | Action |
|-----------|-----------|--------|
| Rate limiting | 5 attempts / minute / IP | Temporary block |
| Account lockout | 10 failed attempts | 30-minute lockout |
| Progressive delay | After 3 attempts | Increasing delay (1s, 2s, 4s, 8s) |
| CAPTCHA | After 5 attempts | Require human verification |
| Alerting | After 20 attempts | Notify security team |

### Token Security

- Access tokens: Never stored in localStorage (XSS risk); use httpOnly cookies or in-memory
- Refresh tokens: httpOnly, Secure, SameSite=Strict cookies
- CSRF protection: Required when using cookie-based auth
- Token binding: Consider binding tokens to device/fingerprint for high-security apps

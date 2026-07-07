# Session Management

## Principle

Sessions are the thread connecting authentication to authorization across requests. They must be short-lived, invalidatable, secure by default, and monitored for abuse.

---

## Session Lifecycle

```
CREATE → VALIDATE → REFRESH → INVALIDATE → CLEANUP
```

| Phase | Action |
|-------|--------|
| Create | Generate session on successful authentication |
| Validate | Verify session on every request (not expired, not revoked) |
| Refresh | Extend session on activity (sliding window) or issue new token |
| Invalidate | Destroy on logout, password change, or suspicious activity |
| Cleanup | Purge expired sessions from storage (scheduled job) |

---

## Timeout Configuration

| Timeout Type | Duration | Use Case |
|-------------|----------|----------|
| Idle timeout | 15-30 minutes | No activity → require re-auth |
| Absolute timeout | 8-24 hours | Maximum session life regardless of activity |
| Remember me | 7-30 days | Extended session with reduced privileges |
| Sensitive operation | 5 minutes | Re-auth for password change, payment, etc. |

```typescript
const SESSION_CONFIG = {
  idleTimeoutMs: 30 * 60 * 1000,        // 30 minutes
  absoluteTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
  rememberMeTimeoutMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  cleanupIntervalMs: 60 * 60 * 1000,     // Hourly cleanup
};
```

---

## Invalidation

### When to Invalidate

| Event | Scope |
|-------|-------|
| User logs out | Current session |
| User clicks "log out everywhere" | All user sessions |
| Password changed | All sessions except current |
| Account compromised | All sessions immediately |
| Role/permissions changed | All sessions (force re-auth) |
| User deactivated/deleted | All sessions immediately |
| MFA disabled | All sessions, require re-auth with MFA |

### Implementation

```typescript
// Redis-backed session store with instant invalidation
class SessionStore {
  async create(userId: string, metadata: SessionMetadata): Promise<string> {
    const sessionId = crypto.randomUUID();
    await redis.setex(`session:${sessionId}`, SESSION_TTL, JSON.stringify({
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ...metadata,
    }));
    // Track user's sessions for "logout everywhere"
    await redis.sadd(`user-sessions:${userId}`, sessionId);
    return sessionId;
  }

  async invalidateAll(userId: string): Promise<void> {
    const sessions = await redis.smembers(`user-sessions:${userId}`);
    if (sessions.length) {
      await redis.del(...sessions.map(id => `session:${id}`));
      await redis.del(`user-sessions:${userId}`);
    }
  }
}
```

---

## Secure Attributes

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `httpOnly` | `true` | Prevents JavaScript access (XSS protection) |
| `secure` | `true` | Only sent over HTTPS |
| `sameSite` | `strict` or `lax` | CSRF protection |
| `path` | `/` or specific path | Limit cookie scope |
| `domain` | Your domain | Don't set to overly broad TLD |
| `maxAge` | Match session timeout | Aligns cookie with server-side expiry |

---

## Concurrent Sessions

### Policy Options

| Policy | Description | Use Case |
|--------|-------------|----------|
| Unlimited | No limit on concurrent sessions | Most consumer apps |
| Limited (e.g., 5) | Max N active sessions | Prevent credential sharing |
| Single session | New login invalidates previous | High-security environments |
| Alert on new | Notify user of new session | Detect unauthorized access |

### Implementation

```typescript
async function enforceSessionLimit(userId: string, maxSessions: number) {
  const sessions = await redis.smembers(`user-sessions:${userId}`);

  if (sessions.length >= maxSessions) {
    // Evict oldest session
    const oldest = await findOldestSession(sessions);
    await invalidateSession(oldest);
    // Optionally notify user
    await notifyUser(userId, 'session_evicted', { reason: 'max_sessions_reached' });
  }
}
```

---

## Session Storage

| Approach | Pros | Cons |
|----------|------|------|
| Server-side (Redis) | Instant invalidation, no size limits | Requires infrastructure |
| Database | Persistent, queryable | Slower for validation on every request |
| JWT (stateless) | No server-side storage | Can't revoke until expiry. Don't use for sessions. |
| Encrypted cookie | Simple, no server state | Size limited, can't revoke, replay risk |

**Recommended:** Server-side sessions in Redis with opaque session IDs in cookies.

---

## Session Fixation Prevention

- Generate a new session ID after successful authentication
- Never accept session IDs from URL parameters
- Invalidate any pre-authentication session

```typescript
async function onLogin(req: Request, user: User) {
  // Destroy any existing session (prevent fixation)
  if (req.sessionId) {
    await sessionStore.invalidate(req.sessionId);
  }
  // Create fresh session with new ID
  const newSessionId = await sessionStore.create(user.id, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  return newSessionId;
}
```

---

## Monitoring

- Log all session creation and destruction events
- Alert on unusual session patterns:
  - Many sessions created for one user in short time
  - Session used from multiple IPs simultaneously
  - Session used after user's working hours
  - Geographic impossibility (two locations far apart in short time)

---

## Anti-Patterns

- **JWTs as sessions with 24-hour expiry** — You can't revoke them. Use server-side sessions.
- **Session ID in URL** — Leaks via referrer headers, bookmarks, shared links.
- **No idle timeout** — Abandoned sessions are attack vectors.
- **Client-side only logout** — Deleting the cookie without invalidating server-side is meaningless.
- **Same session before and after login** — Session fixation vulnerability.
- **No session metadata** — Can't detect suspicious sessions without IP/UA tracking.

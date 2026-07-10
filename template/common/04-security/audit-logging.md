# Audit Logging

## Principle

Audit logs answer "who did what, when, and from where." They're essential for security investigations, compliance, and incident response. Audit logs are separate from application logs — they're an immutable record of actions.

---

## What to Audit

### Always Audit

| Category | Events |
|----------|--------|
| Authentication | Login success/failure, logout, MFA challenge/pass/fail, password change |
| Authorization | Access denied, privilege escalation, role changes |
| Admin actions | User creation/deletion, permission grants, config changes |
| Data access | Read of sensitive data (PII, financial), bulk exports |
| Data modification | Create, update, delete of any business entity |
| Security events | API key creation/revocation, session invalidation, IP allowlist changes |
| System events | Deployment, config change, feature flag toggle, maintenance mode |
| Account management | Invite sent, role changed, account deactivated, team membership changes |

### Audit Conditionally

- Search queries (if they access sensitive data)
- File downloads (especially bulk)
- API key usage (for billing/compliance)
- Integration/webhook configuration changes

### Never Audit

- Health checks
- Static asset requests
- Successful read operations on public data
- Internal heartbeats between services

---

## Audit Log Format

```json
{
  "id": "evt_a1b2c3d4",
  "timestamp": "2024-01-15T10:23:45.123Z",
  "actor": {
    "id": "usr_456",
    "type": "user",
    "ip": "203.0.113.42",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "ses_789"
  },
  "action": "user.role.updated",
  "resource": {
    "type": "user",
    "id": "usr_012",
    "name": "alice@example.com"
  },
  "details": {
    "before": { "role": "member" },
    "after": { "role": "admin" },
    "reason": "Promoted to team lead"
  },
  "outcome": "success",
  "correlationId": "req-xyz-123",
  "service": "user-management-api"
}
```

### Required Fields

| Field | Purpose |
|-------|---------|
| `id` | Unique event identifier |
| `timestamp` | ISO 8601, UTC, millisecond precision |
| `actor` | Who performed the action (user ID, service ID, system) |
| `action` | What was done (verb.noun pattern) |
| `resource` | What was affected (type + ID) |
| `outcome` | success, failure, denied |
| `correlationId` | Links to request context |

---

## Action Naming Convention

```
<domain>.<entity>.<action>

auth.session.created
auth.session.destroyed
auth.login.failed
user.role.updated
user.account.deleted
billing.subscription.cancelled
project.settings.updated
admin.feature-flag.toggled
data.export.requested
```

---

## Retention

| Category | Minimum Retention | Rationale |
|----------|------------------|-----------|
| Security events | 2 years | Compliance, forensics |
| Admin actions | 2 years | Compliance |
| Data access | 1 year | Privacy regulations |
| Data modifications | 1 year | Business continuity |
| Authentication | 1 year | Security investigations |
| System events | 90 days | Operational debugging |

### Archival Strategy

- Hot storage (searchable): 90 days
- Warm storage (queryable with delay): 1 year
- Cold storage (archived, retrievable): 2+ years
- Never delete audit logs without compliance approval

---

## Tamper Protection

Audit logs must be immutable. An attacker who compromises a system should not be able to erase their tracks.

| Control | Implementation |
|---------|---------------|
| Write-only access | Application can append, never update or delete |
| Separate storage | Audit logs in a different system than application data |
| Log signing | Hash chain (each entry includes hash of previous) |
| External backup | Stream to a separate, restricted storage account |
| Access control | Only security team can read audit logs |
| Integrity monitoring | Alert if log volume drops unexpectedly |

### Implementation

```typescript
// Append-only audit log service
class AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    // Validate event structure
    const validated = AuditEventSchema.parse(event);

    // Write to immutable store (not the same DB as application)
    await auditStore.append({
      ...validated,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      integrity: this.computeHash(validated),
    });

    // Stream to external SIEM for tamper detection
    await siem.ingest(validated);
  }

  private computeHash(event: AuditEvent): string {
    const previousHash = await this.getLastHash();
    return crypto.createHash('sha256')
      .update(previousHash + JSON.stringify(event))
      .digest('hex');
  }
}
```

---

## Querying Audit Logs

Support these queries for investigations:

- All actions by a specific user (timeline)
- All actions on a specific resource (history)
- All failed authorization attempts (security)
- All admin actions in a time range (compliance)
- All data exports (data governance)

---

## Alerting

Set up alerts for:

- Multiple failed logins from same IP (brute force)
- Admin role granted (privilege escalation)
- Bulk data export (data exfiltration)
- Audit log gap (log tampering)
- Actions from unusual locations or times
- Service account doing unexpected operations

---

## Anti-Patterns

- **Audit logs in same database as app** — Attacker deletes data AND evidence.
- **Mutable audit logs** — UPDATE/DELETE on audit tables defeats the purpose.
- **Missing actor context** — "Something happened" isn't useful. WHO did it?
- **Logging everything** — Audit logs are for security-relevant actions, not HTTP access logs.
- **No retention policy** — Infinite growth or premature deletion. Define and enforce.
- **Audit logs without monitoring** — Logs nobody reads are useless. Set up alerts.

# Authorization Architecture

Authorization answers "what can this user do?" It is separate from authentication ("who is this user?"). Never conflate the two.

---

## Model Selection

### Role-Based Access Control (RBAC)

Best for: Most applications where permissions map cleanly to job functions.

```
User  →  Role(s)  →  Permission(s)  →  Resource Access
```

### Attribute-Based Access Control (ABAC)

Best for: Complex rules based on user attributes, resource attributes, and context.

```
User Attributes + Resource Attributes + Context  →  Policy Engine  →  Allow/Deny
```

### Recommendation

Start with RBAC. Move to ABAC only when RBAC becomes unwieldy (typically >20 roles or many conditional rules).

---

## RBAC Design

### Role Hierarchy

```
Super Admin
    └── Admin
         └── Manager
              └── Member
                   └── Viewer (read-only)
```

### Role Definitions

| Role | Description | Typical Permissions |
|------|-------------|-------------------|
| Super Admin | System-level access | All permissions, system config |
| Admin | Organization-level management | User management, billing, settings |
| Manager | Team/resource management | Manage team members, approve actions |
| Member | Standard user | CRUD on own resources, read shared |
| Viewer | Read-only access | Read-only on permitted resources |

### Permission Structure

Permissions follow the pattern: `action:resource[:scope]`

```
read:users           # Read any user
write:users          # Create/update any user
delete:users         # Delete any user
read:users:own       # Read own user profile only
write:users:own      # Update own profile only
read:orders          # Read any order
read:orders:team     # Read orders from own team
manage:billing       # Full billing access
admin:settings       # System settings
```

### Permission Matrix

| Permission | Super Admin | Admin | Manager | Member | Viewer |
|-----------|:-----------:|:-----:|:-------:|:------:|:------:|
| read:users | ✓ | ✓ | ✓ (team) | ✓ (own) | ✓ (own) |
| write:users | ✓ | ✓ | ✓ (team) | ✓ (own) | ✗ |
| delete:users | ✓ | ✓ | ✗ | ✗ | ✗ |
| read:orders | ✓ | ✓ | ✓ (team) | ✓ (own) | ✓ (own) |
| write:orders | ✓ | ✓ | ✓ (team) | ✓ (own) | ✗ |
| manage:billing | ✓ | ✓ | ✗ | ✗ | ✗ |
| admin:settings | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## Enforcement Points

Authorization must be enforced at multiple layers. Defense in depth — never rely on a single check.

### Layer 1: API Gateway / Middleware

```
Request → Auth Middleware → Route Handler
                │
                ├── Verify token is valid
                ├── Extract user identity and roles
                └── Basic route-level permission check
```

**What it checks:**
- Is the user authenticated?
- Does the user have the minimum role for this endpoint?
- Rate limiting per user/role

### Layer 2: Application Layer (Use Cases)

```
Use Case → Permission Check → Business Logic
                │
                ├── Does user have the specific permission?
                ├── Resource-level access (own, team, org)
                └── Context-based rules (time, IP, state)
```

**What it checks:**
- Does the user have the specific permission for this action?
- Can this user access this specific resource?
- Are there contextual restrictions?

### Layer 3: Data Layer (Query Filtering)

```
Repository Query → Automatic Scope Filtering → Results
                          │
                          ├── Only return resources user can see
                          └── Apply row-level security
```

**What it checks:**
- Ensure queries never return data the user shouldn't see
- Apply tenant isolation for multi-tenant systems
- Filter by ownership, team, or organization

---

## Implementation Patterns

### Permission Check (Application Layer)

```typescript
// Centralized permission service
class PermissionService {
  canAccess(user: User, action: string, resource: Resource): boolean {
    // 1. Check explicit permissions
    // 2. Check role-based permissions
    // 3. Check resource ownership
    // 4. Check scope (own, team, org)
    // 5. Check contextual rules
  }
}

// Usage in use case
async function getOrder(userId: string, orderId: string) {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError('Order', orderId);

  const user = await userRepository.findById(userId);
  if (!permissionService.canAccess(user, 'read:orders', order)) {
    throw new ForbiddenError('read:orders', orderId);
  }

  return order;
}
```

### Query Scoping (Data Layer)

```typescript
// Automatically scope queries based on user permissions
function scopeQuery(user: User, baseQuery: Query): Query {
  const scope = permissionService.getScope(user, 'read:orders');

  switch (scope) {
    case 'all':
      return baseQuery;  // Admin: no filter
    case 'team':
      return baseQuery.where('teamId', user.teamId);
    case 'own':
      return baseQuery.where('userId', user.id);
    default:
      return baseQuery.where('1', '0');  // No access
  }
}
```

---

## Multi-Tenancy

### Tenant Isolation

| Strategy | Description | Use Case |
|----------|-------------|----------|
| Row-level | Tenant ID column on every table | SaaS with shared infrastructure |
| Schema-level | Separate schema per tenant | Need logical separation |
| Database-level | Separate database per tenant | Regulatory or performance isolation |

### Rules

- Tenant ID injected into every query automatically (middleware)
- Cross-tenant access impossible by default (requires explicit override for admin)
- Tenant context propagated through entire request lifecycle
- Background jobs carry tenant context

---

## Special Cases

### Resource Sharing

When users share resources with others:

| Share Type | Implementation |
|-----------|---------------|
| Public link | Resource has `isPublic` flag + unique token |
| Specific users | `resource_shares` table (resource_id, user_id, permission) |
| Team/group | Share with role/group, checked during authorization |
| Time-limited | Share record has `expiresAt` |

### Elevated Permissions (Step-Up)

Some actions require re-verification:
- Changing email or password
- Deleting account
- Financial transactions above threshold
- Modifying permissions for others

### API Key Scoping

API keys have their own permission set, separate from user roles:

```
API Key: sk_live_abc123
  - Permissions: ["read:orders", "write:orders"]
  - Rate limit: 1000/min
  - IP whitelist: [10.0.0.0/8]
  - Expires: 2025-01-01
```

---

## Audit Trail

All authorization decisions should be auditable:

| Event | Data Captured |
|-------|--------------|
| Permission granted | Who, what permission, by whom, when |
| Permission revoked | Who, what permission, by whom, when |
| Access denied | Who, what they tried, what resource, when |
| Role change | Who, old role, new role, by whom, when |
| Sensitive access | Who accessed what sensitive data, when |

---

## Testing Authorization

### Test Categories

| Test Type | What It Verifies |
|-----------|-----------------|
| Unit tests | Permission service logic |
| Integration tests | Middleware blocks unauthorized requests |
| E2E tests | Complete flow (login → attempt action → allow/deny) |
| Negative tests | Confirm users CANNOT access what they shouldn't |
| Escalation tests | Confirm users can't escalate their own privileges |

### Test Matrix (minimum)

For each protected resource, test:
- Unauthenticated user → 401
- Wrong role → 403
- Correct role, wrong resource (not theirs) → 403
- Correct role, correct resource → 200
- Admin → 200 (for any resource)

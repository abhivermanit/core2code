# Authorization Checklist

## Principle

Authentication tells you WHO someone is. Authorization tells you WHAT they can do. Never trust the client. Enforce permissions server-side on every request. Default deny.

---

## RBAC Implementation

### Role Design

```typescript
const Roles = {
  OWNER: 'owner',       // Full control, can delete org
  ADMIN: 'admin',       // Manage users, settings, billing
  MEMBER: 'member',     // CRUD on own resources, read team resources
  VIEWER: 'viewer',     // Read-only access
  GUEST: 'guest',       // Limited access to shared resources
} as const;
```

### Permission Matrix

Define permissions explicitly. Never derive from role names.

```typescript
const Permissions = {
  'projects:create': ['owner', 'admin', 'member'],
  'projects:read': ['owner', 'admin', 'member', 'viewer'],
  'projects:update': ['owner', 'admin', 'member'],
  'projects:delete': ['owner', 'admin'],
  'users:invite': ['owner', 'admin'],
  'users:remove': ['owner', 'admin'],
  'billing:manage': ['owner'],
  'settings:update': ['owner', 'admin'],
} as const;
```

### Enforcement

```typescript
function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user.role;
    const allowed = Permissions[permission];

    if (!allowed || !allowed.includes(userRole)) {
      // Log the attempt
      logger.warn('Authorization denied', {
        userId: req.user.id,
        permission,
        role: userRole,
        resource: req.params.id,
      });
      throw new ForbiddenError();
    }
    next();
  };
}

// Usage
router.delete('/projects/:id', requirePermission('projects:delete'), deleteProject);
```

---

## Endpoint Protection Checklist

- [ ] Every endpoint has explicit authorization (no "open by default")
- [ ] Authorization checked BEFORE any business logic executes
- [ ] Resource ownership verified (not just role — does this user own THIS resource?)
- [ ] Admin endpoints on separate routes/middleware stack
- [ ] API keys scoped to minimum required permissions
- [ ] Webhook endpoints verify signatures (not open to public)

---

## Never Trust the Client

| What the Client Sends | What You Must Verify Server-Side |
|----------------------|----------------------------------|
| User ID in request body | Use the authenticated session's user ID |
| Role claims in JWT | Verify against database (JWTs can be outdated) |
| "isAdmin: true" in request | Ignore entirely. Check actual role. |
| Resource ID in URL | Verify ownership/access before returning data |
| Quantity/price in order | Recalculate from server-side source of truth |
| File paths | Validate, sanitize, and resolve against allowed directories |

```typescript
// BAD — trusting client-supplied userId
app.get('/users/:userId/orders', (req, res) => {
  const orders = await getOrders(req.params.userId); // IDOR vulnerability
});

// GOOD — using authenticated user's ID
app.get('/my/orders', (req, res) => {
  const orders = await getOrders(req.user.id);
});

// GOOD — verifying ownership for shared resources
app.get('/orders/:orderId', (req, res) => {
  const order = await getOrder(req.params.orderId);
  if (order.userId !== req.user.id && !req.user.isAdmin) {
    throw new NotFoundError(); // Don't reveal existence
  }
  return order;
});
```

---

## Testing by ID Manipulation

Every authorization system must be tested for Insecure Direct Object Reference (IDOR):

### Test Cases

```
1. User A creates resource → User B tries to access via ID → Should get 404
2. User A creates resource → User B tries to update via ID → Should get 404
3. User A creates resource → User B tries to delete via ID → Should get 404
4. Viewer tries admin endpoint → Should get 403
5. Unauthenticated request to protected endpoint → Should get 401
6. Modify sequential IDs to access adjacent records → Should fail
7. Replace UUIDs with other users' UUIDs → Should fail
8. Use archived/deleted user's token → Should fail
```

### Automated IDOR Tests

```typescript
describe('Authorization - IDOR prevention', () => {
  it('user cannot access another user\'s order', async () => {
    const orderByUserA = await createOrder(userA.token, { item: 'test' });

    const response = await request(app)
      .get(`/orders/${orderByUserA.id}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(response.status).toBe(404); // Not 403 — don't reveal existence
  });

  it('user cannot update another user\'s profile', async () => {
    const response = await request(app)
      .patch(`/users/${userA.id}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ name: 'hacked' });

    expect(response.status).toBe(404);
    // Verify no change occurred
    const user = await getUser(userA.id);
    expect(user.name).not.toBe('hacked');
  });
});
```

---

## Common Patterns

### Multi-Tenant Isolation

```typescript
// Every query scoped to tenant
function withTenant(tenantId: string) {
  return { where: { tenantId } };
}

// Middleware ensures tenant context
function tenantMiddleware(req, res, next) {
  req.tenantId = req.user.tenantId; // From authenticated session
  next();
}
```

### Hierarchical Permissions

```
Organization → Team → Project → Resource
Owner of Org has implicit access to all children.
Member of Team has access to Team's Projects only.
```

### Privilege Escalation Prevention

- Users cannot grant roles higher than their own
- Role changes require re-authentication
- Admin actions require step-up authentication (MFA re-prompt)

---

## Anti-Patterns

- **Checking permissions in the UI only** — Attackers don't use your UI.
- **Returning 403 for non-owned resources** — Reveals resource existence. Use 404.
- **Deriving permissions from user ID format** — IDs are not authorization.
- **Caching permissions too aggressively** — Role changes must take effect within minutes.
- **"Admin" backdoor in code** — No hardcoded admin bypasses.

# Playbook: Build an Admin Panel

Admin panels are internal tools. Optimize for power users and data density, not beautiful onboarding flows.

## CRUD Generators

### Philosophy

80% of admin panel pages are list → detail → edit. Don't hand-craft each one.

### Resource Definition

```typescript
interface ResourceConfig {
  name: string;
  table: string;
  fields: FieldConfig[];
  listFields: string[]; // which fields show in list view
  searchFields: string[]; // which fields are searchable
  filterFields: string[]; // which fields appear as filters
  sortDefault: { field: string; direction: 'asc' | 'desc' };
  actions: Action[]; // bulk actions
  permissions: { list: Role[]; create: Role[]; edit: Role[]; delete: Role[] };
}

// Example
const userResource: ResourceConfig = {
  name: 'Users',
  table: 'users',
  fields: [
    { name: 'id', type: 'uuid', readonly: true },
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'enum', options: ['admin', 'member', 'viewer'] },
    { name: 'status', type: 'enum', options: ['active', 'suspended', 'deleted'] },
    { name: 'created_at', type: 'datetime', readonly: true },
  ],
  listFields: ['email', 'name', 'role', 'status', 'created_at'],
  searchFields: ['email', 'name'],
  filterFields: ['role', 'status'],
  sortDefault: { field: 'created_at', direction: 'desc' },
  actions: ['suspend', 'activate', 'delete', 'export'],
  permissions: { list: ['admin'], create: ['admin'], edit: ['admin'], delete: ['admin'] },
};
```

### Generated Views

1. **List view:** Searchable, filterable, sortable table with pagination
2. **Detail view:** All fields, related resources, activity history
3. **Edit view:** Form with validation, save/cancel
4. **Create view:** Form with required fields highlighted

## Audit Log

### What to Log

Every state-changing action by every admin user.

```sql
audit_log (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL, -- denormalized for quick viewing
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'impersonate', 'export'
  resource_type TEXT NOT NULL, -- 'user', 'order', 'setting'
  resource_id TEXT,
  changes JSONB, -- { field: { from: old_value, to: new_value } }
  ip_address INET,
  user_agent TEXT,
  metadata JSONB -- additional context
);
```

### Audit Log Rules

- **Immutable:** Audit logs can never be modified or deleted
- **Always-on:** No way to disable logging for admin actions
- **Queryable:** Filter by user, action, resource, date range
- **Retained:** Keep for minimum 1 year (compliance often requires 7)
- **Include context:** What changed, not just that something changed

### Viewing Audit Log

```
[2024-03-15 14:32] admin@company.com updated User #1234
  Changes: status: active → suspended
           role: admin → member
  IP: 192.168.1.1
  Reason: "Violated ToS section 4.2"
```

## Role Management

### RBAC (Role-Based Access Control)

```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface Permission {
  resource: string; // 'users', 'orders', 'settings'
  actions: ('list' | 'read' | 'create' | 'update' | 'delete')[];
  scope?: 'all' | 'team' | 'own'; // data access scope
}

const roles = {
  superAdmin: {
    permissions: [{ resource: '*', actions: ['*'], scope: 'all' }],
  },
  supportAgent: {
    permissions: [
      { resource: 'users', actions: ['list', 'read', 'update'], scope: 'all' },
      { resource: 'orders', actions: ['list', 'read'], scope: 'all' },
    ],
  },
  contentManager: {
    permissions: [
      { resource: 'posts', actions: ['*'], scope: 'all' },
      { resource: 'media', actions: ['*'], scope: 'own' },
    ],
  },
};
```

### Permission Enforcement

```typescript
// Middleware
function requirePermission(resource: string, action: string) {
  return (req, res, next) => {
    const user = req.adminUser;
    if (!hasPermission(user.role, resource, action)) {
      auditLog('permission_denied', { resource, action, user });
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

## Bulk Operations

### Pattern

```typescript
// Bulk action endpoint
app.post('/admin/users/bulk', async (req, res) => {
  const { ids, action, params } = req.body;

  // Validate
  if (ids.length > 1000) return res.status(400).json({ error: 'Max 1000 items' });
  if (!ALLOWED_BULK_ACTIONS.includes(action)) return res.status(400).json({ error: 'Invalid action' });

  // Execute with progress
  const job = await queue.add('bulk-action', { ids, action, params, userId: req.user.id });
  res.json({ jobId: job.id, status: 'processing' });
});

// Client polls for progress
// GET /admin/jobs/:jobId → { processed: 450, total: 1000, status: 'running' }
```

### Bulk Actions Needed

- Select all matching filter (not just current page)
- Status change (activate, suspend, archive)
- Assignment (reassign owner)
- Tagging (add/remove tags)
- Export selected
- Delete selected (with confirmation)

### Safety

- Confirmation dialog showing count and action
- Preview of affected records (first 5)
- Undo window (30 seconds) for non-destructive actions
- Rate limit bulk operations (prevent accidental mass actions)
- Two-person approval for destructive bulk actions (> 100 items)

## Impersonation

### "View as User" Feature

```typescript
// Start impersonation session
app.post('/admin/impersonate/:userId', async (req, res) => {
  const adminUser = req.user;
  const targetUser = await getUser(req.params.userId);

  // Log impersonation start
  auditLog('impersonate_start', {
    admin: adminUser.id,
    target: targetUser.id,
    reason: req.body.reason, // required!
  });

  // Create impersonation session
  const session = await createImpersonationSession(adminUser, targetUser);
  res.json({ sessionToken: session.token, expiresIn: '1h' });
});
```

### Impersonation Rules

- **Requires reason** — admin must state why they're impersonating
- **Time-limited** — auto-expires after 1 hour
- **Logged** — every action during impersonation is attributed to admin
- **Visual indicator** — impersonation mode shows a banner ("Viewing as user@example.com")
- **Read-only option** — view as user without ability to make changes
- **Cannot impersonate higher role** — support can't impersonate admin
- **Exit any time** — clear button to return to admin session

## Common Admin Features

### Search

- Global search across all resources
- Fuzzy matching (typo-tolerant)
- Search by ID, email, name, or any indexed field
- Recent searches saved
- Keyboard shortcut to focus search (Cmd+K)

### Data Export

- Export any list view to CSV
- Include all fields or selected fields
- Apply current filters to export
- Large exports run async and email result
- Scheduled exports (daily report emails)

### Settings Management

- Feature flags per tenant
- System-wide configuration
- Environment-specific settings
- Setting change requires reason
- All setting changes audited

### Analytics

- User signup trends
- Revenue dashboard
- System health overview
- Support ticket volume
- Feature usage statistics

## Anti-Patterns

- **No audit trail** — "who changed this?" is unanswerable
- **Everyone is admin** — principle of least privilege applies internally too
- **No impersonation** — support can't debug user issues without it
- **Hand-crafted every page** — CRUD should be generated, customize exceptions
- **No bulk operations** — admin does same action one-by-one for 500 records
- **Production-only admin** — admin panel should work in staging with test data
- **No confirmation for destructive actions** — one click shouldn't delete 10K records

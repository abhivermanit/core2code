# Playbook: Build a SaaS

The decisions that make or break a SaaS product happen in the architecture, not the UI.

## Multi-Tenancy

### Strategy Decision

| Approach | Isolation | Cost | Complexity | When to Use |
|----------|-----------|------|------------|-------------|
| Shared DB, shared schema | Low | Lowest | Lowest | Early stage, small tenants |
| Shared DB, separate schemas | Medium | Low | Medium | Medium-sized tenants |
| Separate databases | High | High | High | Enterprise, compliance |

**Start with shared schema + Row Level Security (RLS).** You can migrate to separate DBs for enterprise later.

### Row Level Security (Essential)

```sql
-- Every table has a tenant_id
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policy
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Set tenant context per request
SET app.tenant_id = 'tenant-uuid-here';
```

**Rule:** Never rely on application code alone for tenant isolation. Database-level enforcement is mandatory.

### Tenant Context

```typescript
// Middleware: extract tenant from auth token or subdomain
app.use((req, res, next) => {
  const tenantId = extractTenantId(req); // from JWT, subdomain, or header
  req.tenantId = tenantId;
  // Set DB session context for RLS
  await db.query(`SET app.tenant_id = '${tenantId}'`);
  next();
});
```

## Billing & Subscriptions

### Subscription Models

| Model | Example | Implementation |
|-------|---------|----------------|
| Flat rate | $49/month per workspace | Simple, one price |
| Per-seat | $10/user/month | Track active users |
| Usage-based | $0.01/API call | Metering + billing pipeline |
| Tiered | Free/Pro/Enterprise | Feature gating per plan |
| Hybrid | Base + usage | Combination |

### Billing Architecture

```
User action → Metering service → Usage records → Billing calculation → Invoice → Payment
```

### Implementation Checklist

- [ ] Use Stripe (or equivalent) for payment processing — never build your own
- [ ] Implement idempotent payment processing (retry-safe)
- [ ] Handle subscription lifecycle: trial → active → past_due → canceled
- [ ] Prorate upgrades and downgrades
- [ ] Dunning: retry failed payments with exponential backoff
- [ ] Provide clear upgrade path in-product
- [ ] Invoice generation and history
- [ ] Handle tax (use Stripe Tax or TaxJar)
- [ ] Webhook handling for payment events (not polling)

### Plan Gating

```typescript
// Feature access based on plan
function canAccess(tenant: Tenant, feature: string): boolean {
  const plan = getPlan(tenant.planId);
  return plan.features.includes(feature);
}

// Usage limit enforcement
function checkLimit(tenant: Tenant, resource: string): boolean {
  const plan = getPlan(tenant.planId);
  const usage = getCurrentUsage(tenant.id, resource);
  return usage < plan.limits[resource];
}
```

## Onboarding

### First-Run Experience

```
1. Sign up (email + password, or OAuth)
2. Create workspace/organization
3. Guided setup wizard (3-5 steps max)
4. Sample data populated (so product doesn't feel empty)
5. First "aha moment" within 5 minutes
```

### Onboarding Checklist

- [ ] Sign-up flow < 30 seconds (name, email, password or OAuth)
- [ ] Email verification (don't block product access for it)
- [ ] Workspace creation with sensible defaults
- [ ] Welcome email with getting-started guide
- [ ] In-app tutorial or guided tour (skippable)
- [ ] Sample/seed data so product looks alive
- [ ] Progress indicator ("3 of 5 steps to get started")
- [ ] Clear CTA for the core action

## Admin Panel

### Required Features

- [ ] User management (invite, deactivate, role assignment)
- [ ] Organization/workspace settings
- [ ] Billing management (plan, payment method, invoices)
- [ ] Audit log (who did what, when)
- [ ] Usage dashboard (how much of quota used)
- [ ] API key management (create, revoke, scopes)
- [ ] Integration settings
- [ ] Data export (GDPR compliance)

### Internal Admin (Back-Office)

- [ ] Tenant list with search and filtering
- [ ] Impersonation (view as specific tenant)
- [ ] Feature flag management per tenant
- [ ] Billing override capability
- [ ] Support tools (reset password, unlock account)
- [ ] System health dashboard

## Usage Limits

### Implementation Pattern

```typescript
// Rate limiter per tenant
const limiter = rateLimit({
  keyGenerator: (req) => req.tenantId,
  max: getPlan(req.tenantId).apiLimit,
  windowMs: 60 * 1000, // per minute
});

// Storage limit check
async function checkStorageLimit(tenantId: string, fileSize: number) {
  const usage = await getStorageUsage(tenantId);
  const limit = await getStorageLimit(tenantId);

  if (usage + fileSize > limit) {
    throw new LimitExceededError('Storage limit reached. Upgrade your plan.');
  }
}
```

### Limit Types

| Limit | Enforcement | User Communication |
|-------|-------------|-------------------|
| API rate limit | Hard block (429) | Rate limit headers |
| Storage | Hard block on upload | Usage bar in dashboard |
| Seats/users | Block invite | "Upgrade to add more users" |
| Features | Hide or disable UI | Upgrade prompt |
| History/retention | Soft (data archived) | "Upgrade for longer history" |

## Subscription Lifecycle

```
Trial (14 days)
  │
  ├── Convert → Active subscription
  │     │
  │     ├── Upgrade/Downgrade → Prorated
  │     ├── Payment fails → Past Due (retry 3x)
  │     │     └── All retries fail → Suspended
  │     │           └── 30 days → Canceled (data retained 90 days)
  │     └── Cancel → Grace period → Expired
  │
  └── Trial expires → Free tier (limited) or lock out
```

### Handling Each State

```typescript
switch (subscription.status) {
  case 'trialing':
    // Full access, show days remaining
    break;
  case 'active':
    // Normal access per plan
    break;
  case 'past_due':
    // Show payment banner, still accessible
    break;
  case 'suspended':
    // Read-only access, prominent "update payment" CTA
    break;
  case 'canceled':
    // Data export available, no new actions
    break;
}
```

## Data Architecture

```sql
-- Core SaaS tables
tenants (id, name, plan_id, status, created_at)
users (id, tenant_id, email, role, status)
memberships (user_id, tenant_id, role)  -- for multi-tenant users
plans (id, name, limits, features, price_cents)
subscriptions (id, tenant_id, plan_id, status, current_period_end)
invoices (id, tenant_id, amount_cents, status, paid_at)
audit_log (id, tenant_id, user_id, action, resource, timestamp)
```

## Anti-Patterns

- **No tenant isolation at DB level** — one bug exposes all customer data
- **Building billing from scratch** — use Stripe, spend time on your product
- **No usage limits** — one tenant consumes all resources
- **Long onboarding** — every additional step loses users
- **No audit log** — enterprise customers require it, debugging needs it
- **Mixing tenant data in queries** — always filter by tenant_id, enforce with RLS
- **Hard-coding plan limits** — make them configurable per plan, not in code

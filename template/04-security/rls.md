# Row-Level Security (RLS)

## Principle

RLS enforces data isolation at the database level. Even if application code has a bug, users cannot access rows they don't own. It's defense in depth — not a replacement for application-level authorization, but a safety net beneath it.

---

## What It Is

Row-Level Security is a database feature (PostgreSQL, Supabase, SQL Server) that automatically filters rows based on the current user's context. Every query against a protected table is transparently rewritten to include a filter condition.

```sql
-- Without RLS: application must always remember the WHERE clause
SELECT * FROM orders WHERE user_id = 'usr_123';

-- With RLS: the database enforces it automatically
-- Even "SELECT * FROM orders" only returns user's own rows
```

---

## When to Use

| Scenario | RLS Appropriate? |
|----------|-----------------|
| Multi-tenant SaaS (tenant isolation) | Yes — primary use case |
| User-owned data (my orders, my profile) | Yes |
| Shared/collaborative data (team resources) | Yes, with group policies |
| Public read, authenticated write | Yes — different policies for SELECT vs INSERT |
| Analytics/reporting across tenants | No — use a separate service account that bypasses RLS |
| Database migrations | No — run as superuser |

---

## Implementation Patterns

### Pattern 1: Simple Owner Isolation

```sql
-- Enable RLS on table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own orders
CREATE POLICY orders_owner_policy ON orders
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

### Pattern 2: Tenant Isolation

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- All operations scoped to tenant
CREATE POLICY tenant_isolation ON projects
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### Pattern 3: Role-Based Policies

```sql
-- Members can read all team resources
CREATE POLICY team_read ON documents
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = current_setting('app.current_user_id')::uuid
    )
  );

-- Only owners can delete
CREATE POLICY owner_delete ON documents
  FOR DELETE
  USING (created_by = current_setting('app.current_user_id')::uuid);
```

### Pattern 4: Supabase Auth Integration

```sql
-- Supabase provides auth.uid() automatically from JWT
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_self ON profiles
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Public read, authenticated write
CREATE POLICY posts_read ON posts
  FOR SELECT
  USING (published = true);

CREATE POLICY posts_write ON posts
  FOR INSERT
  WITH CHECK (author_id = auth.uid());
```

---

## Setting Context (Application Side)

```typescript
import type { PoolClient } from 'pg';

// Run queries with the user's RLS context, on ONE connection, in ONE transaction.
// - BEGIN/COMMIT is required: SET LOCAL / set_config(...,true) only live for the
//   current transaction.
// - set_config('name', value, true) is the parameter-safe form. `SET LOCAL`
//   cannot take a bind parameter ($1) — the old version was invalid SQL.
// - The callback MUST use the passed `client`, not the pool, or the context is lost.
async function withUserContext<T>(
  userId: string,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.current_user_id', $1, true)", [userId]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Usage — the query runs on the SAME client that holds the context.
const orders = await withUserContext(req.user.id, (client) =>
  client.query('SELECT * FROM orders'),
);
```

---

## Testing Approach

> In tests, use the same `withUserContext(client => ...)` pattern: set the
> context and run the assertion query on the **same** connection, inside one
> transaction. Setting context on one pooled connection and querying on another
> will not exercise RLS.

### 1. Positive Tests (Can Access Own Data)

```typescript
it('user can read their own orders', async () => {
  await setUserContext(userA.id);
  const orders = await db.query('SELECT * FROM orders');
  expect(orders.every(o => o.user_id === userA.id)).toBe(true);
});
```

### 2. Negative Tests (Cannot Access Others' Data)

```typescript
it('user cannot read another user\'s orders', async () => {
  // Create order as User A
  await setUserContext(userA.id);
  await db.query('INSERT INTO orders (id, user_id, total) VALUES ($1, $2, $3)',
    ['ord-1', userA.id, 100]);

  // Switch to User B — should not see User A's order
  await setUserContext(userB.id);
  const orders = await db.query('SELECT * FROM orders WHERE id = $1', ['ord-1']);
  expect(orders.length).toBe(0);
});
```

### 3. Policy Coverage Tests

```typescript
it('user cannot update another user\'s record', async () => {
  await setUserContext(userB.id);
  const result = await db.query(
    'UPDATE orders SET total = 0 WHERE id = $1 AND user_id = $2',
    ['ord-1', userA.id]
  );
  expect(result.rowCount).toBe(0);
});
```

### 4. Edge Cases to Test

- No user context set (should deny all access)
- Superuser/service role bypasses RLS (expected for migrations)
- Newly created rows are visible to creator
- Shared resources accessible to all team members
- Deleted users' context returns no rows

---

## Common Mistakes

| Mistake | Consequence |
|---------|------------|
| Forgetting `FORCE ROW LEVEL SECURITY` for table owners | Table owner bypasses RLS by default |
| Not setting user context before queries | All rows visible (or no rows, depending on default) |
| Using `SECURITY DEFINER` functions that bypass RLS | Data leaks through function calls |
| Complex subqueries in policies | Performance degradation |
| Not testing the "no context" case | Silent data exposure |
| RLS on tables but not views | Views may bypass policies |

---

## Performance Considerations

- RLS adds a filter to every query — keep policies simple
- Use indexes on the columns referenced in policies (`user_id`, `tenant_id`)
- Avoid correlated subqueries in policies (use joins or materialized lookups)
- Monitor query plans with `EXPLAIN` to ensure policies use indexes
- For high-volume analytics, use a separate connection with elevated privileges

---

## RLS is Defense in Depth

```
Layer 1: API authentication (who are you?)
Layer 2: Application authorization (can you do this?)
Layer 3: Row-Level Security (can you see this row?)
```

All three layers should exist. RLS catches bugs in Layer 2 — it doesn't replace it.

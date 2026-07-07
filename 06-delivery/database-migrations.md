# Database Migrations

Migrations are the most dangerous part of deployment. A bad migration can corrupt data, cause downtime, or be irreversible. Treat them with extreme care.

## Core Principles

1. **Every migration is reversible** (until proven otherwise)
2. **Every migration is tested** against production-like data
3. **Never mix schema changes with data changes** in one migration
4. **Old code must work with new schema** (deploy migration first)
5. **New code must work with old schema** (during rolling deploy)

## Migration Naming

```
YYYYMMDDHHMMSS_verb_noun_detail.sql

20240315120000_create_users_table.sql
20240316090000_add_email_column_to_users.sql
20240320140000_create_index_on_orders_customer_id.sql
20240321100000_backfill_users_display_name.sql
```

**Rules:**
- Timestamp prefix ensures ordering
- Verb describes the action (create, add, remove, rename, alter)
- Never rename or reorder existing migrations
- One logical change per migration file

## Safe Migration Patterns

### Adding a Column

```sql
-- Safe: nullable column, no lock
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Safe: column with default (Postgres 11+, no table rewrite)
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- UNSAFE: NOT NULL without default on existing table
-- ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL;
-- This fails if table has existing rows
```

### Removing a Column

**Never remove a column in the same deploy as the code change.**

```
Step 1: Deploy code that stops reading/writing the column
Step 2: Wait one full release cycle (verify no queries touch it)
Step 3: Deploy migration to drop the column
```

```sql
-- Step 3 migration
ALTER TABLE users DROP COLUMN legacy_name;
```

### Renaming a Column

**Don't rename. Add new, migrate data, drop old.**

```sql
-- Migration 1: Add new column
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Migration 2: Backfill (separate deploy)
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- Migration 3: Drop old (after code uses full_name exclusively)
ALTER TABLE users DROP COLUMN name;
```

### Adding an Index

```sql
-- Safe: concurrent index creation (Postgres, no lock)
CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id);

-- UNSAFE: locks the table during creation
-- CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

**Note:** `CONCURRENTLY` cannot run inside a transaction. Handle this in your migration tool's configuration.

### Changing Column Type

```sql
-- Safe approach: add new column, backfill, swap
ALTER TABLE events ADD COLUMN started_at TIMESTAMPTZ;
-- Backfill in batches
UPDATE events SET started_at = start_date::timestamptz WHERE id BETWEEN ? AND ?;
-- After code switches to new column
ALTER TABLE events DROP COLUMN start_date;
```

## Zero-Downtime Migration Checklist

- [ ] Migration tested against production data volume
- [ ] Migration runs in under 30 seconds (or uses batching)
- [ ] No exclusive table locks on large tables
- [ ] Indexes created with CONCURRENTLY (Postgres)
- [ ] Old code compatible with new schema
- [ ] New code compatible with old schema
- [ ] Down migration written and tested
- [ ] Backfill runs in batches with sleep intervals

## Large Table Migrations

For tables with millions of rows, never do `UPDATE ... SET ... WHERE` on the whole table.

```python
# Batch migration pattern
BATCH_SIZE = 1000
SLEEP_BETWEEN = 0.1  # seconds

while True:
    rows_updated = execute("""
        UPDATE users
        SET new_column = compute_value(old_column)
        WHERE new_column IS NULL
        LIMIT %(batch_size)s
    """, batch_size=BATCH_SIZE)

    if rows_updated == 0:
        break

    time.sleep(SLEEP_BETWEEN)
```

**Why batching matters:**
- Avoids long-running transactions that block other queries
- Prevents replication lag spikes
- Allows progress monitoring
- Can be paused and resumed

## Testing Migrations

### In CI

```bash
# Apply all migrations to empty database
migrate up

# Run down migration for the new migration
migrate down 1

# Re-apply to verify idempotent-ish behavior
migrate up

# Run application tests against the new schema
npm test
```

### Against Production Data

```bash
# Take anonymized snapshot of production
pg_dump --anonymize production > staging_data.sql

# Restore to test environment
psql test_db < staging_data.sql

# Time the migration
time migrate up

# Verify no errors, acceptable duration
```

## Migration Ordering in Deployment

```
1. Run migration (additive changes only)
2. Deploy new code (handles old AND new schema)
3. Verify everything works
4. Run cleanup migration (remove old artifacts)
```

**Never:**
- Run destructive migration before code deploys
- Deploy code that requires new schema before migration runs
- Run migration and code deploy simultaneously

## Down Migrations

Every migration should have a corresponding rollback:

```sql
-- up
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';

-- down
ALTER TABLE users DROP COLUMN preferences;
```

**Exceptions where down migration is impractical:**
- Dropped column (data is gone, can't reverse)
- Changed column type with data loss
- Large data backfills (too expensive to reverse)

For these, document WHY there's no down migration and what the manual recovery plan is.

## Anti-Patterns

- **Editing applied migrations** — migrations are immutable history
- **Combining schema + data changes** — separate concerns, separate deploys
- **No down migrations** — "we'll figure it out" is not a rollback plan
- **Testing only with empty databases** — production has millions of rows and edge cases
- **Lock-heavy operations on big tables** — CREATE INDEX without CONCURRENTLY on a 10M row table = downtime
- **Migration tool that auto-runs on app startup** — migrations should be explicit, deliberate steps
- **Skipping migrations in environments** — all environments run the same migrations in the same order

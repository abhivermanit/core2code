# Database Review Checklist

Review database changes with the same rigor as application code. Schema mistakes are the hardest to fix.

## Schema Design

- [ ] Tables use UUIDs for primary keys (or justified reason for serial/BIGINT)
- [ ] Every table has created_at and updated_at timestamps
- [ ] Column types are appropriate (don't store cents as DECIMAL, use INTEGER)
- [ ] JSONB used only when schema is truly dynamic (not to avoid schema design)
- [ ] Nullable columns are intentionally nullable (default to NOT NULL)
- [ ] TEXT preferred over VARCHAR (no artificial limits unless business rule)
- [ ] ENUM types avoided (use TEXT with CHECK constraint or reference table)
- [ ] Naming conventions consistent (snake_case, singular table names)

## Indexes

- [ ] Primary key exists on every table
- [ ] Foreign key columns have indexes
- [ ] Columns in WHERE clauses have indexes
- [ ] Columns in ORDER BY have indexes (or composite with WHERE)
- [ ] Composite indexes have correct column order (most selective first)
- [ ] Partial indexes used for common filtered queries
- [ ] Unique indexes on business keys (email, SKU, etc.)
- [ ] No duplicate indexes (same columns in same order)
- [ ] Unused indexes identified (bloat queries without benefit)
- [ ] GIN/GiST indexes for JSONB, full-text, array, or geo queries

## Constraints

- [ ] NOT NULL on columns that should never be empty
- [ ] UNIQUE constraints on business keys
- [ ] Foreign key constraints with appropriate ON DELETE (RESTRICT vs CASCADE)
- [ ] CHECK constraints for value validation (status IN ('active', 'suspended'))
- [ ] Exclusion constraints where applicable (prevent overlapping ranges)
- [ ] Default values set for columns with sensible defaults
- [ ] No orphaned records possible (FK constraints prevent them)

## Migrations

- [ ] Migration is additive (safe to run with old code still running)
- [ ] Down migration exists and is tested
- [ ] Migration runs in < 30 seconds (or documented as long-running)
- [ ] No exclusive table locks on tables with active traffic
- [ ] CREATE INDEX CONCURRENTLY used for large tables (Postgres)
- [ ] Data migrations separate from schema migrations
- [ ] Backfill operations use batching with sleep
- [ ] Migration tested against production-like data volume

## Backups

- [ ] Backup schedule appropriate for data criticality
- [ ] Point-in-time recovery enabled (WAL archiving)
- [ ] Backup restore tested within last 30 days
- [ ] Backup encryption enabled
- [ ] Cross-region backup for disaster recovery
- [ ] Backup monitoring (alert on failure or size anomaly)
- [ ] Retention policy documented and enforced

## Row-Level Security

- [ ] RLS enabled on all tenant-scoped tables
- [ ] Policies tested (tenant A cannot query tenant B data)
- [ ] RLS bypass only for admin operations (explicit, audited)
- [ ] New tables have RLS policies before launch
- [ ] JOIN queries don't leak data across tenant boundaries
- [ ] Aggregate functions don't expose cross-tenant data

## Query Performance

- [ ] Slow query log enabled (> 100ms threshold)
- [ ] EXPLAIN ANALYZE run on new queries
- [ ] No sequential scans on large tables (index usage confirmed)
- [ ] N+1 queries eliminated (eager loading, JOINs, or DataLoader)
- [ ] Pagination uses cursor-based approach (not OFFSET on large tables)
- [ ] COUNT(*) avoided on large tables (use estimates or cache)
- [ ] Complex queries have materialized views or pre-computed tables
- [ ] Connection pool sized correctly for workload

## Performance Metrics to Monitor

- [ ] Query execution time (p50, p95, p99)
- [ ] Active connections vs. pool size
- [ ] Cache hit ratio (should be > 99%)
- [ ] Table bloat (dead tuples from frequent updates)
- [ ] Index bloat
- [ ] Replication lag (if using replicas)
- [ ] Disk usage and growth rate
- [ ] Lock wait time

## Common Pitfalls

- [ ] No `SELECT *` in application code (select specific columns)
- [ ] Large text/blob columns not fetched in list queries
- [ ] Transactions kept short (< 5 seconds)
- [ ] Advisory locks used instead of long-held row locks where possible
- [ ] UUID generation is v4 (random) or v7 (time-ordered) — not v1
- [ ] Timezone-aware timestamps (TIMESTAMPTZ, not TIMESTAMP)
- [ ] Money stored as integers (cents) not floats/decimals
- [ ] Soft delete implemented where required (deleted_at column)

## Operational Readiness

- [ ] Connection string uses connection pooler (PgBouncer, Supavisor)
- [ ] Read replicas configured for read-heavy workloads
- [ ] Auto-vacuum tuned for workload (not just defaults)
- [ ] Statement timeout configured (prevent runaway queries)
- [ ] Idle transaction timeout configured
- [ ] Database version is supported (not EOL)
- [ ] Monitoring dashboard for database health
- [ ] Alerting on connection exhaustion, disk usage, replication lag

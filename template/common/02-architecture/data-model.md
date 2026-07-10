# Data Model

This document defines the core data entities, their relationships, and persistence strategy.

---

## Entity Definitions

### Template

```markdown
#### [Entity Name]

**Description:** [What this entity represents in the domain]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| ... | ... | ... | ... |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification time |

**Business Rules:**
- [Rule 1]
- [Rule 2]
```

---

## Core Entities

### User

**Description:** A registered user of the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt/Argon2 hashed password |
| display_name | VARCHAR(100) | NOT NULL | User-facing name |
| status | ENUM | NOT NULL, DEFAULT 'active' | Account status |
| email_verified_at | TIMESTAMP | NULLABLE | When email was verified |
| last_login_at | TIMESTAMP | NULLABLE | Most recent login |
| created_at | TIMESTAMP | NOT NULL | Registration time |
| updated_at | TIMESTAMP | NOT NULL | Last profile update |

**Business Rules:**
- Email must be unique (case-insensitive)
- Password hash is never exposed via API
- Soft-deleted (status = 'deleted'), not hard-deleted

---

### [Entity 2 — placeholder]

Repeat the pattern above for each entity in your domain.

---

## Relationships

### Entity Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌──────────────┐
│   User   │ 1───* │    Order     │ 1───* │  OrderItem   │
└──────────┘       └──────────────┘       └──────────────┘
      │                   │
      │ 1───*            │ *───1
      │                   │
┌──────────┐       ┌──────────────┐
│  Session  │       │   Product    │
└──────────┘       └──────────────┘
```

### Relationship Definitions

| Parent | Child | Cardinality | Cascade | Notes |
|--------|-------|-------------|---------|-------|
| User | Order | 1:N | Soft delete | User has many orders |
| Order | OrderItem | 1:N | Hard delete | Items belong to order |
| Product | OrderItem | 1:N | Restrict | Can't delete product with active orders |
| User | Session | 1:N | Hard delete | Sessions cleaned on logout |

---

## Indexes

### Strategy

- Primary keys: clustered index (automatic)
- Foreign keys: always indexed
- Columns in WHERE clauses: indexed if selectivity > 10%
- Columns in ORDER BY: composite index if combined with filter
- Full-text search: dedicated search index (not DB index)

### Index Definitions

| Table | Index Name | Columns | Type | Rationale |
|-------|-----------|---------|------|-----------|
| users | idx_users_email | email | UNIQUE | Login lookup |
| users | idx_users_status | status | BTREE | Filter active users |
| orders | idx_orders_user_id | user_id | BTREE | User's order history |
| orders | idx_orders_created_at | created_at | BTREE | Recent orders query |
| orders | idx_orders_status_created | status, created_at | COMPOSITE | Filtered + sorted |
| order_items | idx_items_order_id | order_id | BTREE | Order line items |
| order_items | idx_items_product_id | product_id | BTREE | Product order history |

### Index Anti-Patterns to Avoid

- Indexing low-cardinality columns alone (e.g., boolean `is_active`)
- Over-indexing (each index slows writes)
- Missing index on foreign keys (causes table scans on JOIN)
- Index on columns rarely queried

---

## Enums and Constants

### Status Enums

```sql
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');
```

### State Transitions

```
User Status:    active → suspended → active (reactivate)
                active → deleted (soft delete, irreversible via normal flow)

Order Status:   draft → pending → confirmed → shipped → delivered
                pending → cancelled
                confirmed → cancelled (with refund)
```

**Rules:**
- Only valid transitions allowed (enforced in domain logic)
- Every transition logged in audit table
- No skipping states (draft cannot go directly to shipped)

---

## Migration Strategy

### Principles

1. **All migrations versioned** — sequential numbering, stored in source control
2. **Forward-only in production** — rollback via new migration, not undo
3. **Backward-compatible** — old code must work with new schema during deploy
4. **Tested against production-scale data** — before applying

### Expand-Contract Pattern

For breaking changes, use two phases:

**Phase 1 (Expand):** Add new column/table alongside old one
```sql
-- Migration: Add new column
ALTER TABLE users ADD COLUMN display_name VARCHAR(100);
-- Backfill
UPDATE users SET display_name = name WHERE display_name IS NULL;
```

**Phase 2 (Contract):** After all code uses new structure, remove old
```sql
-- Migration: Remove old column (after code deployed)
ALTER TABLE users DROP COLUMN name;
```

### Migration Checklist

- [ ] Migration has a descriptive name: `20240115_add_display_name_to_users`
- [ ] Tested on local with production-size dataset
- [ ] Backward-compatible (old app version still works)
- [ ] Estimated execution time documented (for large tables)
- [ ] Lock analysis done (will this lock the table? for how long?)
- [ ] Rollback migration prepared
- [ ] Data backfill included if needed

### Large Table Migrations

For tables with >1M rows:
- Use `CREATE INDEX CONCURRENTLY` (PostgreSQL)
- Add columns as nullable first, backfill, then add NOT NULL
- Consider `pt-online-schema-change` or similar tools
- Schedule during low-traffic periods
- Monitor replication lag during execution

---

## Data Retention

| Data Type | Retention Period | Archive Strategy | Deletion Method |
|-----------|-----------------|-----------------|-----------------|
| Active user data | Indefinite | N/A | On account deletion request |
| Inactive user data | 24 months | Move to cold storage | Scheduled job |
| Transaction records | 7 years | Archive to cold storage | Regulatory minimum |
| Audit logs | 12 months hot | Cold storage for 7 years | Automated lifecycle |
| Session data | 30 days | None | TTL-based expiry |
| Temporary/draft data | 7 days | None | Scheduled cleanup |

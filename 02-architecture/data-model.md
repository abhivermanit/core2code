# Data Model

## Entity Relationship Diagram

```
[ERD here]
```

## Entities

### Entity: [Name]

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| | | | |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

## Relationships

| From | To | Type | Description |
|------|-----|------|-------------|
| | | 1:N | |

## Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| | | | |

## Migration Strategy

- Tool: 
- Versioning: Sequential / Timestamp
- Rollback: Supported via down migrations

# [System Name] — Data Model

## Entities

### [Entity Name]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| | | | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

## Relationships

```
[Entity A] 1──N [Entity B]
[Entity B] N──M [Entity C]
```

## Indexes

| Table | Columns | Type | Purpose |
|-------|---------|------|---------|
| | | | |

## Enums

### [Enum Name]

| Value | Description |
|-------|-------------|
| | |

## Migration Strategy

- Tool: 
- Naming: `YYYYMMDDHHMMSS_description`
- Rollback: Each migration has a down counterpart

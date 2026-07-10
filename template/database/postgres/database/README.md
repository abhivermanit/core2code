# {{PROJECT_NAME}} — Database (PostgreSQL)

## Local development

```bash
docker compose up -d postgres
```

Connection string:

```
postgresql://postgres:postgres@localhost:5432/{{PROJECT_NAME}}
```

`schema.sql` runs automatically on first container start. Copy `.env.example`
into your backend as needed.

# Environments

Environments exist to catch problems before they reach users. If your environments aren't realistic, they're not catching anything.

## Environment Tiers

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| Local | Developer machine | Seed/fake data | Individual |
| CI | Automated testing | Generated per run | Pipeline only |
| Staging | Pre-production validation | Anonymized prod copy | Team |
| Production | Live users | Real data | Restricted |

## Dev/Staging/Production Parity

**The closer staging is to production, the more problems it catches.**

### What Must Match Production

- Same database engine and version
- Same runtime version (Node, Python, etc.)
- Same infrastructure topology (load balancer, cache, queue)
- Same environment variable structure (different values, same keys)
- Same deployment process (what deploys to prod deploys to staging)
- Same monitoring and logging stack

### What Can Differ

- Scale (fewer instances, smaller databases)
- Data volume (subset, anonymized)
- External service keys (sandbox/test accounts)
- Domain names and certificates
- Cost tier (smaller instance sizes)

## Configuration Per Environment

### Environment Variables (Not Code)

```bash
# .env.local
DATABASE_URL=postgresql://localhost:5432/app_dev
REDIS_URL=redis://localhost:6379
STRIPE_KEY=sk_test_...
LOG_LEVEL=debug

# .env.staging
DATABASE_URL=postgresql://staging-db:5432/app
REDIS_URL=redis://staging-cache:6379
STRIPE_KEY=sk_test_...
LOG_LEVEL=info

# .env.production
DATABASE_URL=postgresql://prod-db:5432/app
REDIS_URL=redis://prod-cache:6379
STRIPE_KEY=sk_live_...
LOG_LEVEL=warn
```

### Configuration Rules

1. **Never commit secrets** — use secret managers (Vault, AWS Secrets Manager, Doppler)
2. **Same variable names across all environments** — code shouldn't branch on environment name
3. **Validate config at startup** — fail fast if a required variable is missing
4. **Document every variable** — `.env.example` with descriptions, no real values

```typescript
// Good: validate at startup
const config = {
  databaseUrl: requireEnv('DATABASE_URL'),
  redisUrl: requireEnv('REDIS_URL'),
  logLevel: env('LOG_LEVEL', 'info'),
};

// Bad: check environment name in business logic
if (process.env.NODE_ENV === 'production') {
  // This creates invisible behavior differences
}
```

## Data Isolation

### Production Data Rules

- Production data never flows to lower environments without anonymization
- PII must be scrubbed, hashed, or replaced with synthetic data
- Financial data must be replaced entirely
- Anonymization scripts are tested and version-controlled

### Staging Data Strategy

```
Option A: Anonymized production snapshot (weekly refresh)
  Pro: Realistic data volume and patterns
  Con: Refresh process needed, storage cost

Option B: Seed data scripts
  Pro: Fast, deterministic, version-controlled
  Con: May miss edge cases from real data

Option C: Hybrid — seed structure + anonymized samples
  Recommended for most teams
```

### Test Data Isolation

- Each test run gets isolated data (transactions, schemas, or separate DBs)
- Tests never depend on shared mutable state
- CI databases are ephemeral — created and destroyed per run
- Never share databases between parallel test runs

## Environment Promotion

```
Code: feature → main → release tag
      │         │       │
Env:  local     staging production
```

**Rules:**
- Same artifact promotes through environments (build once, deploy many)
- Only configuration changes between environments
- Never rebuild for production — promote the staging-tested artifact
- Database migrations apply in order: staging first, then production

## Local Development

### Requirements

- Single command to start (`docker-compose up` or `npm run dev`)
- Seed data applied automatically
- All services available locally (or mocked)
- Hot reload for fast iteration
- Matches production behavior as closely as practical

### Local vs. Cloud Services

| Service | Local | Staging/Prod |
|---------|-------|--------------|
| Database | Docker container | Managed (RDS, Cloud SQL) |
| Cache | Docker Redis | Managed (ElastiCache) |
| Queue | Docker RabbitMQ | Managed (SQS) |
| Storage | LocalStack/MinIO | S3 |
| Auth | Local provider | Auth0/Cognito |
| Email | Mailhog/Inbucket | SendGrid/SES |

## Anti-Patterns

- **"Works on my machine"** — if local doesn't match prod, you're guessing
- **Manual environment setup** — infrastructure as code or it doesn't exist
- **Shared staging database** — one developer's test corrupts another's
- **Production testing** — "let's just test it in prod" means your other environments failed
- **Environment-specific code branches** — if code behaves differently per env, that's a bug waiting to happen
- **Stale staging** — if staging hasn't been deployed in weeks, it's not catching anything

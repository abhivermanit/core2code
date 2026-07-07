# CI/CD Pipeline

## Pipeline Stages

```
Push → Lint → Build → Test → Security Scan → Deploy (staging) → E2E → Deploy (prod)
```

## CI (Continuous Integration)

### On Every PR

1. Lint (ESLint, Prettier)
2. Type check (tsc --noEmit)
3. Unit tests
4. Integration tests
5. Security scan (dependency audit)
6. Build

### On Merge to Main

1. Full test suite
2. Build artifacts
3. Deploy to staging
4. E2E tests against staging

## CD (Continuous Deployment)

### Staging

- Auto-deploy on merge to main
- Run E2E tests
- Smoke tests

### Production

- Manual promotion from staging (or auto after E2E pass)
- Canary deployment (5% → 25% → 100%)
- Automated rollback on error rate spike

## Configuration

- Secrets via CI/CD secrets store (not in code)
- Environment-specific variables per stage
- Artifact versioning (git SHA + timestamp)

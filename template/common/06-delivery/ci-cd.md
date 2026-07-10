# CI/CD Pipeline

Your pipeline is your quality gatekeeper. If it passes, the code is deployable. If it doesn't enforce that standard, it's just decoration.

## Pipeline Stages

```
commit → lint → typecheck → test → security → build → deploy
```

### 1. Lint & Format (< 30s)

- Run on every push, no exceptions
- Fix formatting issues automatically in pre-commit hooks, not CI
- CI should only verify, never auto-fix

### 2. Type Check (< 60s)

- Full type check with strict mode
- Catches interface mismatches between packages early
- Separate from build — faster feedback

### 3. Test (< 5 min)

- Unit tests run on every push
- Integration tests run on every PR
- E2E tests run before deploy to staging/production
- Flaky tests get quarantined, not skipped

### 4. Security Scan (< 2 min)

- Dependency vulnerability scan (npm audit, Snyk, Trivy)
- Secret detection (gitleaks, trufflehog)
- SAST for common patterns (SQL injection, XSS)
- Block on critical/high vulnerabilities

### 5. Build (< 3 min)

- Reproducible builds (lock files committed)
- Build artifacts tagged with commit SHA
- Docker images scanned before push to registry

### 6. Deploy

- Automated to staging on merge to main
- Production deploy requires explicit trigger or tag
- Deploy artifact, never rebuild

## Quality Gates

### Block Deployment When:

- Any test fails
- Type errors exist
- Critical/high security vulnerabilities detected
- Code coverage drops below threshold (set once, never lower)
- Build size exceeds budget by >10%
- Migration hasn't been tested against production-like data

### Warn But Don't Block:

- Medium security vulnerabilities (track, fix within sprint)
- Coverage decreases slightly (< 2%)
- New TODO/FIXME without linked issue
- Dependency is outdated (not vulnerable, just old)

## Pipeline Design Principles

### Fast feedback first
Order stages by speed. Linting catches issues in 10 seconds — don't make developers wait 5 minutes for tests before they see a typo.

### Fail fast
First failure stops the pipeline. Don't waste compute on a build when types don't check.

### Parallelise where possible
```
lint ──┐
type ──┼── test ── build ── deploy
scan ──┘
```

### Cache aggressively
- Node modules (hash of lock file)
- Build outputs (turbo, nx remote cache)
- Docker layers (multi-stage builds)
- Test results for unchanged packages

### Idempotent deploys
Running the same pipeline twice with the same input produces the same output. No side effects from re-runs.

## Branch Strategy

| Branch | Trigger | Deploys To |
|--------|---------|------------|
| feature/* | push | — (CI only) |
| main | merge | staging |
| release/* | tag | production |
| hotfix/* | merge to main + tag | staging → production |

## Monorepo Considerations

- Only run affected package pipelines (turbo, nx)
- Shared package changes trigger all dependents
- Infrastructure changes trigger full pipeline
- Use path filters in CI config

## Anti-Patterns

- **CI that takes 30+ minutes** — developers stop waiting, stop caring
- **Manual steps in "automated" pipeline** — if a human has to click, it's not CD
- **Deploy on Friday** — your pipeline doesn't know what day it is, but your on-call does
- **Skipping stages for "urgent" fixes** — urgent fixes need MORE validation, not less
- **Shared mutable environments** — each PR gets its own preview, or conflicts hide

## Recommended Tools

| Purpose | Options |
|---------|---------|
| CI Platform | GitHub Actions, GitLab CI, CircleCI |
| Monorepo | Turborepo, Nx |
| Security | Snyk, Trivy, Gitleaks |
| Artifacts | Docker Registry, S3, GitHub Packages |
| Secrets | Vault, AWS Secrets Manager, 1Password CI |

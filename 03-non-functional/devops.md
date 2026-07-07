# DevOps Requirements

## CI/CD Pipeline

Every project must have:

- Automated testing on every PR
- Automated linting and formatting checks
- Automated dependency vulnerability scanning
- Automated secret scanning (pre-commit + CI)
- Automated build and deployment
- Rollback support

## Pipeline Stages

```
Push → Lint → Typecheck → Test → Security Scan → Build → Deploy (staging) → E2E → Deploy (prod)
```

## Infrastructure as Code

- All infrastructure defined in code (Terraform, Pulumi, CDK, etc.)
- Infrastructure changes go through PR review
- State stored remotely (never local)
- Environment parity (dev ≈ staging ≈ production)

## Deployment Requirements

Each deployment must include:

- Environment validation
- Migration verification
- Health checks post-deploy
- Rollback plan documented and tested
- Monitoring enabled before traffic is routed
- Logging enabled before traffic is routed

## Quality Gates

No deployment if:

- Critical tests fail
- Security scan finds high/critical vulnerabilities
- Build fails
- Linting fails

## Secret Scanning

- Pre-commit hooks to prevent secret commits
- CI-level scanning as backup
- Immediate rotation if secrets are exposed
- Alert the team on any secret detection

## Automation Targets

| Task | Automated | Manual |
|------|-----------|--------|
| Linting | Yes | Never |
| Testing | Yes | Never |
| Deployment (staging) | Yes | Never |
| Deployment (prod) | Yes (with approval gate) | Emergency only |
| Rollback | Yes | Emergency only |
| Security scan | Yes | Pen test annually |

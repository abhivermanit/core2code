# Secrets Management

## Principle

Secrets in source code are breaches waiting to happen. Secrets must live outside code, rotate on schedule, and be revocable instantly. Treat every secret as already compromised — design for fast rotation.

---

## Rules

1. **Never commit secrets to git.** Not in code, not in config files, not in comments, not "temporarily."
2. **Never log secrets.** Not in error messages, not in debug output, not in request logs.
3. **Never hardcode secrets.** Not even "just for local development."
4. **Rotate regularly.** Every secret has a rotation schedule.
5. **Revoke immediately** when a team member leaves or a secret may be compromised.
6. **Least privilege.** Each secret has minimum required permissions.

---

## Storage Hierarchy

| Environment | Storage |
|-------------|---------|
| Local development | `.env` file (gitignored), or secret manager CLI |
| CI/CD | Pipeline secrets (GitHub Actions secrets, GitLab CI variables) |
| Staging/Production | Secret manager (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager) |
| Kubernetes | Sealed Secrets or External Secrets Operator → mounted as env vars |

### Never

- Commit `.env` files to git
- Store secrets in plain-text config files
- Pass secrets as command-line arguments (visible in `ps`)
- Store secrets in client-side code (JS bundles, mobile app strings)
- Share secrets via Slack, email, or other unencrypted channels

---

## .env.example Pattern

Every project has a `.env.example` that documents required variables with placeholder values:

```bash
# .env.example — committed to git
# Copy to .env and fill in real values

# Database
DATABASE_URL=postgres://user:password@localhost:5432/myapp_dev

# Auth Provider
AUTH0_CLIENT_ID=your-client-id-here
AUTH0_CLIENT_SECRET=your-client-secret-here
AUTH0_DOMAIN=your-tenant.auth0.com

# External Services
STRIPE_SECRET_KEY=sk_test_replace_me
SENDGRID_API_KEY=SG.replace_me

# App
JWT_SECRET=generate-a-random-string-min-32-chars
ENCRYPTION_KEY=generate-a-random-256-bit-key
```

### Rules for .env.example

- Keep in sync with actual required variables
- Use obviously fake values (`replace_me`, `your-x-here`)
- Document which secrets are required vs optional
- Group by service/category
- Update in the same PR that adds a new secret requirement

---

## Rotation

### Schedule

| Secret Type | Rotation Frequency | Notes |
|------------|-------------------|-------|
| Database passwords | 90 days | Automate with secret manager |
| API keys | 90 days | Regenerate and update |
| JWT signing keys | 30 days | Support key overlap during transition |
| Encryption keys | Yearly | Requires re-encryption strategy |
| Personal access tokens | 90 days | Set expiration on creation |
| SSH keys | Yearly | Use certificates instead where possible |

### Rotation Procedure

1. Generate new secret
2. Deploy new secret alongside old one (both valid temporarily)
3. Verify new secret works in production
4. Revoke old secret
5. Confirm no systems still use old secret (check logs for auth failures)

---

## Revocation

### When to Revoke Immediately

- Team member leaves the company
- Team member changes roles (loses access)
- Secret appears in logs, git history, or error messages
- Suspected breach or unauthorized access
- Dependency compromised (npm package, GitHub Action)

### Revocation Procedure

1. Revoke/rotate the compromised secret
2. Audit access logs for unauthorized use
3. Notify affected team members
4. If secret was in git: rotate AND consider the entire git history compromised
5. Document the incident

---

## Secret Detection

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

### CI Integration

- Run `gitleaks`, `trufflehog`, or `detect-secrets` on every PR
- Block merge if secrets detected
- Scan entire git history periodically

### What to Detect

| Pattern | Examples |
|---------|----------|
| API keys | `sk_live_`, `AKIA`, `ghp_`, `xoxb-` |
| Private keys | `-----BEGIN RSA PRIVATE KEY-----` |
| Connection strings | `postgres://user:pass@`, `mongodb+srv://` |
| Tokens | `Bearer eyJ`, `token=` in URLs |
| Passwords | `password=`, `secret=` with actual values |

---

## If a Secret is Committed

1. **Do NOT just delete it in a new commit.** Git history preserves it.
2. Rotate the secret immediately (new value).
3. Revoke the old secret.
4. If it's a highly sensitive secret, consider git history rewriting (BFG Repo Cleaner) — but coordinate with the team.
5. Add the pattern to `.gitignore` and pre-commit hooks.
6. Post-mortem: how did it happen? How do we prevent it?

---

## Anti-Patterns

- **"It's just a test key"** — Test keys in code trains developers to commit secrets. Use `.env` always.
- **Sharing secrets in Slack** — Use a secret manager or encrypted sharing tool (1Password, Vault).
- **Same secret across environments** — Staging compromise = production compromise.
- **No rotation schedule** — Assume all secrets are eventually leaked. Plan for it.
- **Secrets in Docker images** — Use build-time args or runtime env injection, not baked-in values.
- **Secrets in CI logs** — Mask all secret variables in CI output.

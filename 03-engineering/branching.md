# Branching Strategy

## Principle

Branches are short-lived workspaces. The longer a branch lives, the more pain it causes. Merge early, merge often.

---

## Recommended: Trunk-Based Development

All developers commit to `main` (the trunk) through short-lived feature branches. No long-lived develop or release branches.

```
main ─────●─────●─────●─────●─────●─────●─────
           \   /       \   /       \   /
            ─●─         ─●─         ─●─
         feat/auth   fix/login   feat/billing
         (1-2 days)  (hours)     (2-3 days)
```

### Rules

| Rule | Details |
|------|---------|
| Branch lifetime | Max 2-3 days. Ideal: < 1 day |
| Merge target | Always `main` |
| Deployment | `main` is always deployable |
| Feature incomplete? | Use feature flags, not long-lived branches |
| Release | Tag from `main` or use release branches (max 1 week) |

### When to Use

- Continuous deployment environments
- Teams with good CI/CD and automated testing
- Products where releasing frequently is possible
- Teams that embrace feature flags

---

## Alternative: GitFlow (Simplified)

For products with scheduled releases, external compliance needs, or multiple supported versions.

```
main ──────────●───────────────────●──────────
               ↑                   ↑
release/1.2 ───●───●───●──────────/
               ↑       ↑
develop ───●───●───●───●───●───●───●──────────
            \   / \       / \   /
             ─●─   ───●───   ─●─
           feat/x  feat/y   fix/z
```

### Branches

| Branch | Purpose | Lifetime |
|--------|---------|----------|
| `main` | Production-ready code | Permanent |
| `develop` | Integration branch | Permanent |
| `feature/*` | New features | Days |
| `release/*` | Release stabilization | 1-2 weeks max |
| `hotfix/*` | Emergency production fixes | Hours |

### When to Use

- Mobile apps with app store review cycles
- Enterprise software with scheduled release trains
- Products requiring release candidates and QA sign-off
- Multiple versions supported simultaneously

---

## Branch Naming Convention

```
<type>/<ticket-id>-<short-description>
```

### Types

| Prefix | Use |
|--------|-----|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `refactor/` | Code restructuring |
| `docs/` | Documentation |
| `test/` | Test additions/changes |
| `chore/` | Maintenance |
| `hotfix/` | Emergency production fix |
| `release/` | Release preparation |

### Examples

```
feat/PROJ-123-oauth-google-login
fix/PROJ-456-duplicate-billing-charge
refactor/PROJ-789-extract-validation-middleware
hotfix/PROJ-001-null-pointer-checkout
release/2.1.0
```

### Rules

- Lowercase only
- Hyphens as separators (no underscores, no slashes beyond the type prefix)
- Include ticket ID when one exists
- Keep description to 3-5 words max
- No personal names (`john/feature` — don't)

---

## Lifetime Limits

| Branch Type | Max Lifetime | Escalation |
|-------------|-------------|------------|
| Feature | 3 days | Split into smaller PRs |
| Fix | 1 day | Pair with someone |
| Hotfix | 4 hours | All hands on deck |
| Release | 1 week | Cut scope, don't extend |
| Stale (no commits in 7 days) | Delete | Auto-cleaned by CI |

---

## Protection Rules

### `main` Branch

- [ ] Require PR with at least 1 approval
- [ ] Require passing CI (build + tests + lint)
- [ ] No direct pushes (even admins)
- [ ] No force pushes (ever)
- [ ] Require up-to-date branch before merge
- [ ] Require signed commits (optional but recommended)
- [ ] Auto-delete branches after merge

### `develop` Branch (if using GitFlow)

- [ ] Require PR with at least 1 approval
- [ ] Require passing CI
- [ ] No force pushes

### `release/*` Branches

- [ ] Only accept `fix/` and `docs/` branches
- [ ] Require 2 approvals
- [ ] Require full test suite pass

---

## Keeping Branches Current

```bash
# Rebase your feature branch onto latest main
git fetch origin
git rebase origin/main

# If conflicts are complex, prefer merge instead
git merge origin/main
```

**Rule:** Rebase for clean history on your own branch. Never rebase a branch others are working on.

---

## Stale Branch Cleanup

Automate with CI:

```yaml
# Example: GitHub Actions scheduled cleanup
- Branches with no commits in 14 days → notify author
- Branches with no commits in 30 days → auto-delete
- Merged branches → delete immediately after merge
```

---

## Anti-Patterns

- **Branch named `develop2` or `main-backup`** — There's only one truth. Don't fork it.
- **Feature branch alive for 3 weeks** — Break it up. Ship incrementally behind flags.
- **Merging `main` into feature repeatedly** — Rebase instead (or merge once before PR).
- **"I'll just commit to main real quick"** — No. Branch protection exists for a reason.
- **Personal branches that never get merged** — Time-box or delete.

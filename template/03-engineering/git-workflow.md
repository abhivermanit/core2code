# Git Workflow

## Principle

Git history is documentation. Every commit tells a story. Reviewers, future developers, and automated tools rely on clean, consistent history to understand *why* changes were made.

---

## Conventional Commits

All commits follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Use When |
|------|----------|
| `feat` | Adding new functionality |
| `fix` | Fixing a bug |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration changes |
| `chore` | Maintenance tasks (no production code change) |
| `revert` | Reverting a previous commit |

### Scope

Scope is the module or area affected: `auth`, `billing`, `api`, `ui`, `db`, `ci`.

### Examples

```
feat(auth): add OAuth2 login with Google provider
fix(billing): prevent duplicate charge on retry timeout
refactor(api): extract validation logic into middleware
docs(readme): add local development setup instructions
perf(db): add index on users.email for login queries
```

### Breaking Changes

```
feat(api)!: change pagination from offset to cursor-based

BREAKING CHANGE: The `page` parameter is removed. Use `cursor` instead.
Clients must update to the new pagination format.
```

---

## Commit Message Rules

| Rule | Rationale |
|------|-----------|
| Subject line ≤ 72 characters | Fits in git log, GitHub UI, terminal |
| Use imperative mood ("add", not "added" or "adds") | Matches git's own conventions |
| No period at end of subject | It's a title, not a sentence |
| Body wraps at 72 characters | Readable in terminal |
| Reference issue/ticket in footer | Traceability: `Closes #123` or `Refs PROJ-456` |
| One logical change per commit | Easier to review, revert, cherry-pick |

---

## Pull Request Standards

### Size Limits

| Metric | Target | Hard Limit |
|--------|--------|------------|
| Lines changed | < 200 | 400 |
| Files changed | < 10 | 20 |
| Review time | < 30 min | 1 hour |

**If your PR exceeds limits:**
1. Split into stacked PRs (base → feature-part-1 → feature-part-2)
2. Extract refactoring into a separate PR first
3. Ship behind a feature flag in smaller increments

### PR Title

Follows the same conventional commit format:
```
feat(auth): implement password reset flow
```

### PR Description Template

```markdown
## What
Brief description of the change.

## Why
Link to issue/ticket. Context on why this approach was chosen.

## How
Key implementation decisions. Anything non-obvious.

## Testing
How this was tested. What to verify during review.

## Checklist
- [ ] Tests pass
- [ ] No new warnings
- [ ] Documentation updated (if applicable)
- [ ] Migration included (if applicable)
```

---

## Merge Strategy

### Default: Squash Merge

- All PRs are squash-merged into the target branch
- The squash commit message is the PR title (conventional commit format)
- PR body becomes the commit body
- Individual branch commits are preserved in PR history but not in main

### When to Use Merge Commit

- Release branches merging into main (preserves release history)
- Long-lived integration branches

### Never Use

- Rebase-and-merge on shared branches (rewrites history others depend on)
- Force push to main/develop (ever)

---

## Workflow Summary

```
1. Create branch from main (see branching.md)
2. Make small, focused commits (conventional format)
3. Push and open PR when ready for review
4. Address review feedback (new commits, not amend)
5. Squash merge when approved + CI green
6. Delete branch after merge
```

---

## Tooling

| Tool | Purpose |
|------|---------|
| `commitlint` | Enforce conventional commit format |
| `husky` / `lefthook` | Git hooks for local enforcement |
| `semantic-release` | Automated versioning from commit history |
| `commitizen` | Interactive commit message helper |

### commitlint config

```js
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 72],
  },
};
```

---

## Anti-Patterns

- `"fix stuff"` — Meaningless. What was fixed?
- `"WIP"` as a final commit — Squash before merge.
- Mixing refactoring with feature work — Separate PRs.
- 2000-line PRs — Nobody reviews these properly. Split them.
- Commit with failing tests — CI should catch this, but don't do it.

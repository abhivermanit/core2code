# Release Strategy

Releases are a communication tool. Versioning tells consumers what changed and whether they need to act.

## Semantic Versioning (SemVer)

```
MAJOR.MINOR.PATCH
  │      │      └── Bug fixes, no API changes
  │      └───────── New features, backward compatible
  └──────────────── Breaking changes
```

### When to Bump What

| Change | Version | Example |
|--------|---------|---------|
| Breaking API change | MAJOR | Remove endpoint, change response shape |
| New feature (additive) | MINOR | New endpoint, new optional field |
| Bug fix | PATCH | Fix calculation, fix typo in response |
| Security fix (no API change) | PATCH | Patch vulnerability |
| Dependency update (no behavior change) | PATCH | Update lodash |

### Pre-release Versions

```
1.0.0-alpha.1   → early development, unstable
1.0.0-beta.1    → feature complete, may have bugs
1.0.0-rc.1      → release candidate, should be final
1.0.0           → stable release
```

## Release Cadence

### For SaaS Products (Continuous Delivery)

- Deploy to production multiple times per day
- No version numbers visible to users
- Internal versioning via commit SHA or build number
- Features released via feature flags, not deploys

### For Libraries/APIs (Versioned Releases)

- PATCH: as needed (bug fixes, security)
- MINOR: every 2-4 weeks (feature batches)
- MAJOR: quarterly at most (planned, communicated)
- Never break consumers without a migration path

### For Mobile Apps

- Minor release every 2 weeks
- Hotfix within 24-48 hours (App Store review permitting)
- Major version aligned with platform releases (iOS/Android)

## Release Process

### 1. Prepare Release

```bash
# Create release branch
git checkout -b release/1.2.0

# Update version
npm version minor  # or patch/major

# Generate changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Review and edit changelog for clarity
```

### 2. Validate

- [ ] All tests pass on release branch
- [ ] Staging deploy successful
- [ ] QA sign-off (if applicable)
- [ ] Performance benchmarks within bounds
- [ ] Security scan clean
- [ ] Migration tested

### 3. Release

```bash
# Tag
git tag v1.2.0
git push origin v1.2.0

# This triggers CI to:
# - Build production artifacts
# - Deploy to production
# - Publish package (if library)
# - Create GitHub release
```

### 4. Communicate

- Release notes published
- Breaking changes highlighted
- Migration guide for major versions
- Stakeholders notified

## Release Notes

Good release notes answer: **What changed? Do I need to do anything?**

```markdown
## v1.2.0 (2024-03-15)

### Features
- Add webhook support for order status changes (#234)
- Support bulk user import via CSV (#256)

### Fixes
- Fix pagination returning duplicate items when data changes during iteration (#278)
- Fix timezone handling in scheduled reports (#281)

### Breaking Changes
- None

### Migration
- No action required
```

### Release Notes Rules

- Written for the consumer, not the developer
- No internal jargon or ticket numbers without context
- Breaking changes always have migration instructions
- Security fixes called out explicitly (after patch is available)

## Hotfix Process

```
main ─────●─────────●──────────
           \       / (merge back)
            hotfix/fix-auth-bypass
                │
                └── production (emergency deploy)
```

1. Branch from the current production tag
2. Apply minimal fix (not the full feature branch)
3. Full CI pipeline (no shortcuts)
4. Deploy to production
5. Merge fix back to main
6. Communicate to stakeholders

### Hotfix Criteria

A hotfix is warranted when:
- Security vulnerability actively exploited
- Data corruption occurring
- Critical business flow broken (payments, auth)
- SLA breach in progress

A hotfix is NOT warranted for:
- Non-critical bugs (wait for next release)
- Feature requests from stakeholders
- "It would be nice to also include..."

## Changelog Management

Use [Conventional Commits](https://www.conventionalcommits.org/) for automated changelog generation:

```
feat: add webhook support for order events
fix: handle timezone correctly in scheduled reports
BREAKING CHANGE: remove deprecated /v1/users endpoint
```

## Anti-Patterns

- **No versioning** — consumers can't pin to stable versions
- **Major version every release** — SemVer loses meaning
- **Changelog is git log** — nobody reads raw commits
- **Releasing on Friday** — your users have weekends too
- **Surprise breaking changes** — always deprecate first, remove later
- **Holding releases for "one more thing"** — ship what's ready, batch less

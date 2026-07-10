# Dependency Review Checklist

Every dependency is a bet on someone else's code. Review them like you'd review a hire.

## Before Adding a Dependency

### Is It Necessary?

- [ ] Can this be implemented in < 100 lines of code? (if yes, consider writing it yourself)
- [ ] Does the standard library already provide this? (check first)
- [ ] Is the dependency solving a complex problem? (crypto, parsing, protocols = justified)
- [ ] Will this dependency be used in production? (dev-only deps have lower bar)
- [ ] Are you using > 20% of the dependency's features? (if not, it's bloat)

### Popularity and Adoption

- [ ] Weekly downloads > 10K (for npm) or equivalent activity
- [ ] GitHub stars indicate community interest (not proof of quality, but signal)
- [ ] Used by known projects or companies (check dependents)
- [ ] Active community (issues addressed, PRs reviewed)
- [ ] Not a single-person vanity project with no users

### Maintenance Health

- [ ] Last commit within 6 months (not abandoned)
- [ ] Issues are triaged and responded to
- [ ] Releases are regular (security patches, bug fixes)
- [ ] Multiple contributors (bus factor > 1)
- [ ] Clear versioning (SemVer followed)
- [ ] Changelog maintained
- [ ] CI/CD visible and passing

### License

- [ ] License is compatible with your project (MIT, Apache-2.0, BSD = safe)
- [ ] No GPL (if your project is not GPL)
- [ ] No SSPL or BSL (if deploying as a service)
- [ ] License file present in repository
- [ ] No license change history (stability)
- [ ] Transitive dependencies also have compatible licenses

### Size and Performance

- [ ] Bundle size impact measured (use bundlephobia.com or similar)
- [ ] No unnecessary sub-dependencies pulled in
- [ ] Tree-shakeable (for frontend dependencies)
- [ ] Minimal runtime overhead
- [ ] Doesn't duplicate functionality already in your bundle

### Security

- [ ] No known vulnerabilities (check npm audit, Snyk, GitHub advisories)
- [ ] No obfuscated code (readable source)
- [ ] No suspicious install/postinstall scripts
- [ ] Package name isn't a typosquatting variant (verify spelling)
- [ ] Published by the expected author/org
- [ ] Source repository matches published package (verify provenance)

### Alternatives Considered

- [ ] At least 2-3 alternatives evaluated
- [ ] Trade-offs documented (why this one over alternatives)
- [ ] Switching cost acceptable (how hard to replace later?)
- [ ] API surface is reasonable (not over-engineered, not too thin)

## Ongoing Maintenance

### Regular Review (Monthly)

- [ ] Automated vulnerability scanning enabled (Dependabot, Snyk, Renovate)
- [ ] Outdated dependencies flagged and prioritized
- [ ] Critical/high vulnerabilities patched within 24 hours
- [ ] Medium vulnerabilities patched within 1 sprint
- [ ] Major version updates evaluated quarterly

### Red Flags (Immediate Action)

- [ ] Dependency goes unmaintained (no commits in 12 months)
- [ ] Maintainer account compromised (supply chain attack)
- [ ] License changes to incompatible terms
- [ ] Vulnerability with no patch available (evaluate alternatives)
- [ ] Sudden ownership transfer to unknown party

## Dependency Hygiene

- [ ] Lock file committed (exact versions in production)
- [ ] `npm audit` or equivalent runs in CI (block on critical)
- [ ] Unused dependencies removed (depcheck, knip)
- [ ] Dev dependencies separated from production
- [ ] Peer dependencies specified correctly (for libraries)
- [ ] No duplicate packages at different versions (check bundle)
- [ ] Resolution overrides documented and justified

## Decision Record

When adding a new dependency, document:

```markdown
## Dependency: [name]

**Purpose:** What does it do for us?
**Alternatives considered:** [list with reasons for rejection]
**Size impact:** [bundle size added]
**License:** [MIT/Apache/etc.]
**Maintenance:** [last release, contributor count]
**Switching cost:** [low/medium/high — how hard to replace?]
**Added by:** [who] on [date]
```

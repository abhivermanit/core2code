# Dependency Policy

## Principle

Every dependency is a liability. It's code you didn't write, can't fully control, and must maintain forever. Add dependencies deliberately — never on impulse.

---

## Before Adding a Dependency

Ask these questions in order:

1. **Can we write this in < 50 lines?** If yes, write it. You don't need `left-pad`.
2. **Is the problem well-scoped?** Libraries that do one thing well (e.g., `date-fns`) beat Swiss-army-knife packages (e.g., `moment`).
3. **Is there a platform API?** `fetch`, `crypto`, `URL`, `AbortController` — use native before reaching for a package.
4. **Is it maintained?** Check: last commit < 6 months, open issues triaged, more than 1 maintainer.
5. **Is it trustworthy?** Check: known publisher, reasonable download count, no typosquatting risk.

---

## Verification Checklist

Before `npm install` / `pip install` / `cargo add`:

- [ ] Package name is spelled correctly (check the registry URL directly)
- [ ] Publisher/org is verified or well-known
- [ ] Repository link exists and matches the package
- [ ] No install scripts that execute arbitrary code (`preinstall`, `postinstall`)
- [ ] License is compatible with our project (MIT, Apache-2.0, BSD preferred)
- [ ] Transitive dependency count is reasonable (check with `npm explain` or equivalent)
- [ ] No known vulnerabilities (`npm audit`, `pip-audit`, `cargo audit`)

---

## Reject If

| Signal | Action |
|--------|--------|
| Package published < 30 days ago with no track record | Do not install |
| Name is suspiciously similar to a popular package | Investigate — likely typosquat |
| Single maintainer with no org affiliation | Evaluate carefully, prefer alternatives |
| Excessive permissions requested (postinstall scripts) | Block unless justified |
| Unmaintained (> 12 months no release, unresolved CVEs) | Find alternative or fork |
| Pulls in > 50 transitive dependencies for a simple task | Find a lighter alternative |

---

## Version Pinning

- **Lock files are mandatory.** `package-lock.json`, `yarn.lock`, `Pipfile.lock`, `Cargo.lock` — always committed.
- **Pin exact versions in application code.** Use `1.2.3`, not `^1.2.3`, not `~1.2.3`.
- **Libraries may use ranges** to avoid peer dependency conflicts, but applications pin.
- **Never use `latest` tag** in any configuration or CI script.

---

## Audit Schedule

| Action | Frequency |
|--------|-----------|
| `npm audit` / equivalent in CI | Every build |
| Review and update dependencies | Bi-weekly (automated with Dependabot/Renovate) |
| Full dependency tree review | Quarterly |
| Remove unused dependencies | Monthly (use `depcheck`, `deptry`, or equivalent) |

---

## Maximum Dependency Age

- **Critical/high severity vulnerability:** Patch within 48 hours.
- **Medium severity:** Patch within 1 sprint (2 weeks).
- **Low severity:** Patch within 1 month.
- **Major version behind:** Evaluate upgrade path within 1 quarter.
- **Two+ major versions behind:** Treat as tech debt, schedule upgrade.

---

## Approved Dependency Categories

Maintain a curated list of pre-approved packages for common needs:

| Need | Approved | Avoid |
|------|----------|-------|
| HTTP client | `fetch` (native), `ky` | `axios` (for new projects), `request` |
| Date handling | `date-fns`, `Temporal` (when stable) | `moment` |
| Validation | `zod`, `valibot` | `joi` (for new projects) |
| Testing | `vitest`, `jest` | `mocha` + `chai` combo |
| Logging | `pino`, `winston` | `console.log` in production |

---

## Process for Adding a New Dependency

1. Open a PR with **only** the dependency addition (no feature code)
2. PR description must include:
   - Why this dependency is needed
   - Alternatives considered and why they were rejected
   - Size impact (bundle size for frontend, install size for backend)
   - Maintenance assessment (last release, maintainer count, open issues)
3. Requires approval from tech lead or designated dependency reviewer
4. CI must pass audit checks before merge

---

## Removing Dependencies

- Run dead dependency detection monthly
- Removing a dependency is always a valid PR — even if it requires writing 50 lines of replacement code
- Fewer dependencies = smaller attack surface = faster installs = fewer breaking upgrades

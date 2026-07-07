# Dependency Security

## Principle

Every dependency is an attack vector. Supply chain attacks are increasing in frequency and sophistication. Verify before installing, monitor continuously, and maintain a policy for new packages.

---

## Supply Chain Attack Vectors

| Attack | How It Works | Example |
|--------|-------------|---------|
| Typosquatting | Package name similar to popular package | `crossenv` vs `cross-env` |
| Account takeover | Attacker gains access to maintainer's npm account | `ua-parser-js` (2021) |
| Dependency confusion | Private package name published to public registry | Internal package names on npm |
| Malicious maintainer | Maintainer adds malicious code to existing package | `event-stream` (2018) |
| Install scripts | Arbitrary code runs during `npm install` | Cryptominers in postinstall |
| Protestware | Maintainer sabotages their own package intentionally | `colors` / `faker` (2022) |

---

## Package Verification Checklist

Before adding any new dependency:

- [ ] **Name verification** — Visit the registry directly. Don't rely on search results.
- [ ] **Publisher check** — Known org or individual with track record?
- [ ] **Source code review** — Repository link exists. Code matches published package.
- [ ] **Install scripts** — Run `npm info <pkg> scripts`. Block if `preinstall`/`postinstall` runs arbitrary code.
- [ ] **Dependency count** — `npm explain <pkg>`. Excessive transitive deps = larger attack surface.
- [ ] **Maintenance signals** — Recent commits, triaged issues, multiple maintainers.
- [ ] **Vulnerability scan** — `npm audit`, `snyk test`, or equivalent reports clean.
- [ ] **License compatibility** — MIT, Apache-2.0, BSD are safe. GPL may have implications.
- [ ] **Download stats** — Very low downloads + recent publish = suspicious.

---

## Lock Files

Lock files are mandatory. They pin exact versions of the entire dependency tree.

| Package Manager | Lock File | Must Commit? |
|----------------|-----------|--------------|
| npm | `package-lock.json` | Yes |
| yarn | `yarn.lock` | Yes |
| pnpm | `pnpm-lock.yaml` | Yes |
| pip | `Pipfile.lock` or `requirements.txt` (pinned) | Yes |
| cargo | `Cargo.lock` | Yes (for applications) |
| go | `go.sum` | Yes |

### Rules

- Never delete lock files to "fix" install issues. Investigate the conflict.
- CI must install with `npm ci` (not `npm install`) to use exact lock file versions.
- Diffs to lock files in PRs should be reviewed (large unexplained changes are suspicious).
- Lock file integrity hashes verify packages haven't been tampered with.

---

## Automated Scanning

### CI Pipeline (Every Build)

```yaml
# GitHub Actions example
- name: Audit dependencies
  run: npm audit --audit-level=high

- name: Check for known vulnerabilities
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Scheduled (Weekly)

- Full vulnerability scan of all dependencies
- License compliance check
- Unused dependency detection
- New advisory notifications

### Tools

| Tool | Purpose |
|------|---------|
| `npm audit` | Built-in vulnerability scanning |
| Snyk | Deep scanning, fix PRs, monitoring |
| Dependabot | Auto-update PRs for vulnerable deps |
| Renovate | Dependency update automation (more configurable) |
| Socket.dev | Supply chain attack detection (behavioral analysis) |
| `depcheck` / `deptry` | Unused dependency detection |

---

## New Package Policy

### Process

1. Developer identifies need for new dependency
2. Check: Can we do this without a dependency? (< 50 lines of code?)
3. Check: Is there an approved package for this need already?
4. If new package needed: open a PR with ONLY the dependency addition
5. PR includes: justification, alternatives considered, security assessment
6. Requires approval from designated security reviewer or tech lead

### Automatic Rejection Criteria

| Signal | Action |
|--------|--------|
| Published within last 30 days, no track record | Reject |
| Single maintainer, no org | Extra scrutiny required |
| Name is 1-2 characters different from a popular package | Investigate typosquatting |
| Has `preinstall` or `postinstall` scripts without clear justification | Reject |
| Pulls in > 100 transitive dependencies | Find alternative |
| No repository link or repository doesn't match | Reject |
| Deprecated or archived | Reject |

---

## Incident Response for Compromised Dependencies

1. **Identify** — Which version is affected? Are we using it?
2. **Pin** — Lock to last known good version immediately.
3. **Assess** — Did the malicious code execute in our environment?
4. **Remediate** — Update to patched version, or remove and replace.
5. **Audit** — Check if data was exfiltrated or systems were modified.
6. **Report** — Notify affected users if data was compromised.

---

## Monitoring

- Subscribe to security advisories for critical dependencies
- Enable Dependabot/Snyk alerts on repositories
- Review dependency update PRs weekly (don't let them pile up)
- Track dependency age — anything > 2 major versions behind needs attention
- Monitor for namespace changes (maintainer transferred package ownership)

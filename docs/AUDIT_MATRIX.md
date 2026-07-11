# Audit Matrix — Design Document

**Status:** Approved design, pre-implementation. No code in this repo implements
this yet — see [ROADMAP.md](../ROADMAP.md) Milestone 2.

This is Core2Code's core IP: the definition of what "production ready" means,
phase by phase. It's expected to change slowly, unlike the engine that
executes it.

## Design principles

### 1. Audit evidence, not filenames

A check must never hard-require a specific file path (e.g.
`docs/02-architecture/architecture.md`). Two projects can both have a
legitimate architecture decision trail — one in markdown ADRs, one in
Confluence links recorded in the README, one in code-level design comments.
The check asks *"does evidence of X exist"*, and a check's evidence
definition lists multiple acceptable forms. Core2Code's own scaffolded
paths (`template/common/0X-*/*.md`) are *one* acceptable form, not the
requirement.

### 2. Every check is either Automatic or Manual — never both

- **Automatic (Static)** checks answer a binary, mechanically verifiable
  question: does this evidence exist / is this mechanism wired up? Result is
  `pass` or `fail`. Examples: a CI config file exists, a migrations
  directory has versioned files, an auth middleware module is imported in
  the request pipeline.
- **Manual (Human)** checks ask a quality/soundness question a tool cannot
  reliably infer: is the scope well-bounded, is the architecture sound, is
  the threat model complete, is an ADR's reasoning good. These never
  resolve to `pass`/`fail` — they resolve to `manual_review`, with guidance
  on what a human (or an AI assistant acting as reviewer) should look for.

Pretending an Automatic check can assess quality (e.g. "PRD.md exists" ==
"the product is well-scoped") is the failure mode this avoids. A check is
scoped to what its type can actually prove.

### 3. Check record schema

Every check — implemented or not yet — should be describable by:

| Field | Meaning |
| --- | --- |
| `id` | Stable identifier, `<phase>/<slug>` |
| `title` | Human-readable name |
| `phase` | One of the 7 lifecycle phases |
| `severity` | `critical` \| `high` \| `medium` \| `info` |
| `type` | `automatic` \| `manual` |
| `whyItMatters` | One sentence: what breaks in production if this is missing |
| `evidence` | What satisfies the check — described as forms of evidence, not a single file path |
| `remediation` | What to do if it fails / is flagged |

Two fully-specified examples, to show the shape:

```yaml
id: security/secrets-management
title: No secrets committed to source
phase: security
severity: critical
type: automatic
whyItMatters: >
  A committed API key or DB credential is compromised the moment it's
  pushed, and rotating it after the fact doesn't undo exposure.
evidence: >
  No high-confidence secret patterns (API keys, private keys, connection
  strings with embedded credentials) found in tracked files; secrets are
  referenced via env vars / a secrets manager, and .env-style files are
  gitignored.
remediation: >
  Move the secret to an env var or secrets manager, rotate the exposed
  credential, and add the file pattern to .gitignore.
```

```yaml
id: architecture/decision-quality
title: Architectural decisions are reasoned and documented
phase: architecture
severity: high
type: manual
whyItMatters: >
  Undocumented or unreasoned architecture decisions get silently
  relitigated or contradicted as the codebase grows, and AI coding
  assistants have no record of *why* a pattern was chosen.
evidence: >
  A reviewer can point to specific decision records (ADRs, design docs,
  linked tickets, or equivalent) that state the decision, the
  alternatives considered, and the tradeoff reasoning — not just "we use
  Postgres" with no rationale.
remediation: >
  Write or backfill ADRs for the significant decisions already made;
  require an ADR for the next one.
```

Filling out `whyItMatters` / `evidence` / `remediation` for every check below
is Milestone-2-prep writing work — tracked, not yet done. The table below is
the id/title/severity/type inventory; full records get written as each
phase is implemented.

### 4. Outcome model

Automatic checks: `pass` | `fail`.
Manual checks: always `manual_review` (never auto-scored pass/fail).

Scoring only counts Automatic checks toward the phase percentage. Manual
checks are surfaced in the report as a distinct "Needs Review" list per
phase — visible, but not silently averaged into a score that implies a
machine verified something it didn't.

### 5. Severity → CLI mapping

The matrix below uses four tiers (critical/high/medium/info). The current
engine's `Severity` type has three (`error`/`warn`/`info`). Decision: map at
implementation time, don't widen the engine type yet —
`critical`+`high` → `error`, `medium` → `warn`, `info` → `info`. This keeps
Milestone 1's frozen engine untouched; Critical vs. High is still visible in
the report/JSON via the matrix-level severity even though the engine only
scores at `error` granularity. Revisit widening `Severity` to 4 values in
Milestone 3 if the collapsed granularity proves to actually hide meaningful
prioritization.

---

## Phase 1 — Discovery

*Is there a defined problem before there's code?*

| id | title | severity | type |
| --- | --- | --- | --- |
| discovery/problem-defined | A problem statement / PRD exists | critical | automatic |
| discovery/scope-defined | Scope (in/out) is explicitly bounded | high | manual |
| discovery/functional-requirements | Functional requirements are documented | high | automatic |
| discovery/nonfunctional-requirements | Non-functional requirements (perf, scale, availability targets) documented | high | automatic |
| discovery/risks-documented | Known risks are documented | medium | automatic |
| discovery/assumptions-documented | Assumptions are documented and marked validated/unvalidated | medium | automatic |
| discovery/problem-quality | The problem statement is specific and falsifiable, not generic | medium | manual |

*Automatic = evidence of the artifact exists somewhere recognized. Manual = is the content actually good.*

## Phase 2 — Architecture

*Were structural decisions made deliberately, not improvised?*

| id | title | severity | type |
| --- | --- | --- | --- |
| architecture/design-exists | An architecture description (components, data flow) exists | critical | automatic |
| architecture/data-model-exists | A data model / schema description exists | critical | automatic |
| architecture/auth-design-exists | AuthN/AuthZ design is documented | high | automatic |
| architecture/api-contracts-exist | API contracts are documented (OpenAPI, GraphQL schema, or equivalent) | high | automatic |
| architecture/decision-records-exist | Decisions are recorded (ADRs or equivalent), not just implied by code | high | automatic |
| architecture/decision-quality | Decision records show real reasoning and alternatives considered | high | manual |
| architecture/threat-model-exists | A threat model exists | medium | automatic |
| architecture/threat-model-quality | The threat model covers the system's actual attack surface | high | manual |
| architecture/design-quality | The architecture is sound for the stated non-functional requirements | high | manual |

## Phase 3 — Engineering

*Day-to-day code health.* (12 checks already implemented in Milestone 1 —
listed here for matrix completeness; ids below don't yet match the shipped
ids one-to-one and will be reconciled when Milestone 2 touches this phase.)

| id | title | severity | type |
| --- | --- | --- | --- |
| engineering/manifest-exists | Project manifest (package.json or equivalent) exists | critical | automatic |
| engineering/source-structure | Source code lives in a recognizable structure | high | automatic |
| engineering/coding-standards | Coding standards / lint configuration present | high | automatic |
| engineering/error-handling-pattern | A consistent error-handling pattern is evident | high | manual |
| engineering/config-management | Configuration is externalized (env vars / config files), not hardcoded | high | automatic |
| engineering/logging-standard | A structured logging approach is present | medium | automatic |
| engineering/dependency-policy | Dependency update/review policy exists | medium | automatic |
| engineering/type-safety | Static type checking is enabled and enforced | medium | automatic |
| engineering/readme-exists | A README describing the project exists | info | automatic |
| engineering/engines-pinned | Runtime/engine versions are pinned | info | automatic |

## Phase 4 — Security

| id | title | severity | type |
| --- | --- | --- | --- |
| security/authentication | Authentication is implemented | critical | automatic |
| security/authorization | Authorization / access control is implemented | critical | automatic |
| security/secrets-management | No secrets committed to source; secrets externalized | critical | automatic |
| security/rate-limiting | Rate limiting is present on public endpoints | high | automatic |
| security/input-validation | Input validation is present at trust boundaries | high | automatic |
| security/transport-security | HTTPS/TLS is enforced | high | automatic |
| security/dependency-scanning | Dependency vulnerability scanning is configured | medium | automatic |
| security/security-headers | CSP / security headers are configured | medium | automatic |
| security/authz-model-quality | The authorization model matches actual data sensitivity | high | manual |
| security/audit-logging | Security-relevant events are audit-logged | info | automatic |
| security/cookie-flags | Session cookies use Secure/HttpOnly/SameSite | info | automatic |

## Phase 5 — Quality

| id | title | severity | type |
| --- | --- | --- | --- |
| quality/unit-tests | Unit tests exist and run | critical | automatic |
| quality/ci-runs-tests | Tests run automatically in CI | critical | automatic |
| quality/integration-tests | Integration tests exist | high | automatic |
| quality/api-tests | API/contract tests exist | high | automatic |
| quality/coverage-adequacy | Test coverage reflects the system's critical paths, not just easy ones | high | manual |
| quality/security-tests | Security tests (SAST / dependency scan) run in CI | medium | automatic |
| quality/performance-tests | Performance/load tests exist | medium | automatic |
| quality/accessibility-tests | Accessibility tests exist (where UI applies) | info | automatic |

## Phase 6 — Delivery

| id | title | severity | type |
| --- | --- | --- | --- |
| delivery/ci-cd-pipeline | A CI/CD pipeline is configured | critical | automatic |
| delivery/environment-separation | Dev/staging/prod environments are separated in config | critical | automatic |
| delivery/rollback-strategy | A rollback mechanism exists | high | automatic |
| delivery/migrations-versioned | Database migrations are versioned and reproducible | high | automatic |
| delivery/tls-at-deploy | TLS is configured at the deployment target | medium | automatic |
| delivery/release-strategy | A versioning/release strategy is evident (semver, CHANGELOG) | medium | automatic |
| delivery/pipeline-quality | The pipeline actually gates bad releases (not just runs and ignores failures) | high | manual |
| delivery/feature-flags | Feature flags are available for risky changes | info | automatic |

## Phase 7 — Operations

| id | title | severity | type |
| --- | --- | --- | --- |
| operations/monitoring | Monitoring/observability is configured | critical | automatic |
| operations/backups | Backups are configured | critical | automatic |
| operations/alerting | Alerting is configured for critical failures | high | automatic |
| operations/disaster-recovery-plan | A disaster recovery plan exists | high | automatic |
| operations/dr-plan-quality | The DR plan's RTO/RPO match the business's actual tolerance | high | manual |
| operations/runbooks | Runbooks exist for known operational tasks | medium | automatic |
| operations/incident-process | An incident/postmortem process exists | medium | automatic |
| operations/cost-monitoring | Cost monitoring is configured | info | automatic |
| operations/capacity-planning | A capacity planning approach is documented | info | automatic |

---

## Totals

- 7 phases, 50 checks (up from 12 today).
- Automatic: 39. Manual: 11.
- Critical: 12. High: 20. Medium: 11. Info: 7.

## Open items before Milestone 2 implementation

1. Reconcile Engineering's matrix ids with the ids already shipped in
   `src/audit/checks/engineering.ts` (Milestone 1) — either rename shipped
   ids to match or update this doc, don't diverge silently.
2. Write full `whyItMatters` / `evidence` / `remediation` records for each
   check (currently only 2 are fully specified as examples above).
3. Decide how `manual_review` surfaces in `CheckStatus` / `AuditReport` —
   this is an engine change, deferred to when Milestone 2 actually starts
   writing code.

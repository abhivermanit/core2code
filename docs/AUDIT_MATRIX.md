# Audit Matrix — Design Document

**Status:** Approved design, pre-implementation. No code in this repo
implements this yet — see [ROADMAP.md](../ROADMAP.md) Milestone 2 for the
phased delivery order. Every check below must conform to
[AUDIT_SPEC.md](AUDIT_SPEC.md), which is the frozen record format; this doc
is the inventory of *which* checks exist, not the format contract.

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

### 3. Record format

Every check's full record (why/evidence/pass/fail/remediation/references)
must conform to [AUDIT_SPEC.md](AUDIT_SPEC.md). This doc only carries the
inventory columns (id/title/severity/type) per phase; full records get
authored when a phase is actually implemented, in the order set by the
roadmap's vertical delivery plan (Discovery → Architecture → Security →
Quality → Delivery+Operations).

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

## Phase 1 — Discovery — ✅ Shipped (v0.6 Discovery Audit Pack)

*Is there a defined problem before there's code?* Implemented in
`src/audit/checks/discovery.ts`.

| id | title | severity | type |
| --- | --- | --- | --- |
| DISC-001 | A problem statement / PRD exists | critical | automatic |
| DISC-002 | Scope (in/out) is explicitly bounded | high | manual |
| DISC-003 | Functional requirements are documented | high | automatic |
| DISC-004 | Non-functional requirements (perf, scale, availability targets) documented | high | automatic |
| DISC-005 | Known risks are documented | medium | automatic |
| DISC-006 | Assumptions are documented and marked validated/unvalidated | medium | automatic |
| DISC-007 | The problem statement is specific and falsifiable, not generic | medium | manual |

*Automatic = evidence of the artifact exists somewhere recognized. Manual = is the content actually good.*

## Phase 2 — Architecture

*Were structural decisions made deliberately, not improvised?*

| id | title | severity | type |
| --- | --- | --- | --- |
| ARCH-001 | An architecture description (components, data flow) exists | critical | automatic |
| ARCH-002 | A data model / schema description exists | critical | automatic |
| ARCH-003 | AuthN/AuthZ design is documented | high | automatic |
| ARCH-004 | API contracts are documented (OpenAPI, GraphQL schema, or equivalent) | high | automatic |
| ARCH-005 | Decisions are recorded (ADRs or equivalent), not just implied by code | high | automatic |
| ARCH-006 | Decision records show real reasoning and alternatives considered | high | manual |
| ARCH-007 | A threat model exists | medium | automatic |
| ARCH-008 | The threat model covers the system's actual attack surface | high | manual |
| ARCH-009 | The architecture is sound for the stated non-functional requirements | high | manual |

## Phase 3 — Engineering

*Day-to-day code health.* (12 checks already implemented in Milestone 1,
predating this spec — see Open Items below for reconciliation.)

| id | title | severity | type |
| --- | --- | --- | --- |
| ENG-001 | Project manifest (package.json or equivalent) exists | critical | automatic |
| ENG-002 | Source code lives in a recognizable structure | high | automatic |
| ENG-003 | Coding standards / lint configuration present | high | automatic |
| ENG-004 | A consistent error-handling pattern is evident | high | manual |
| ENG-005 | Configuration is externalized (env vars / config files), not hardcoded | high | automatic |
| ENG-006 | A structured logging approach is present | medium | automatic |
| ENG-007 | Dependency update/review policy exists | medium | automatic |
| ENG-008 | Static type checking is enabled and enforced | medium | automatic |
| ENG-009 | A README describing the project exists | info | automatic |
| ENG-010 | Runtime/engine versions are pinned | info | automatic |

## Phase 4 — Security

| id | title | severity | type |
| --- | --- | --- | --- |
| SEC-001 | Authentication is implemented | critical | automatic |
| SEC-002 | Authorization / access control is implemented | critical | automatic |
| SEC-003 | No secrets committed to source; secrets externalized | critical | automatic |
| SEC-004 | Rate limiting is present on public endpoints | high | automatic |
| SEC-005 | Input validation is present at trust boundaries | high | automatic |
| SEC-006 | HTTPS/TLS is enforced | high | automatic |
| SEC-007 | Dependency vulnerability scanning is configured | medium | automatic |
| SEC-008 | CSP / security headers are configured | medium | automatic |
| SEC-009 | The authorization model matches actual data sensitivity | high | manual |
| SEC-010 | Security-relevant events are audit-logged | info | automatic |
| SEC-011 | Session cookies use Secure/HttpOnly/SameSite | info | automatic |

## Phase 5 — Quality

| id | title | severity | type |
| --- | --- | --- | --- |
| QUAL-001 | Unit tests exist and run | critical | automatic |
| QUAL-002 | Tests run automatically in CI | critical | automatic |
| QUAL-003 | Integration tests exist | high | automatic |
| QUAL-004 | API/contract tests exist | high | automatic |
| QUAL-005 | Test coverage reflects the system's critical paths, not just easy ones | high | manual |
| QUAL-006 | Security tests (SAST / dependency scan) run in CI | medium | automatic |
| QUAL-007 | Performance/load tests exist | medium | automatic |
| QUAL-008 | Accessibility tests exist (where UI applies) | info | automatic |

## Phase 6 — Delivery

| id | title | severity | type |
| --- | --- | --- | --- |
| DEL-001 | A CI/CD pipeline is configured | critical | automatic |
| DEL-002 | Dev/staging/prod environments are separated in config | critical | automatic |
| DEL-003 | A rollback mechanism exists | high | automatic |
| DEL-004 | Database migrations are versioned and reproducible | high | automatic |
| DEL-005 | TLS is configured at the deployment target | medium | automatic |
| DEL-006 | A versioning/release strategy is evident (semver, CHANGELOG) | medium | automatic |
| DEL-007 | The pipeline actually gates bad releases (not just runs and ignores failures) | high | manual |
| DEL-008 | Feature flags are available for risky changes | info | automatic |

## Phase 7 — Operations

| id | title | severity | type |
| --- | --- | --- | --- |
| OPS-001 | Monitoring/observability is configured | critical | automatic |
| OPS-002 | Backups are configured | critical | automatic |
| OPS-003 | Alerting is configured for critical failures | high | automatic |
| OPS-004 | A disaster recovery plan exists | high | automatic |
| OPS-005 | The DR plan's RTO/RPO match the business's actual tolerance | high | manual |
| OPS-006 | Runbooks exist for known operational tasks | medium | automatic |
| OPS-007 | An incident/postmortem process exists | medium | automatic |
| OPS-008 | Cost monitoring is configured | info | automatic |
| OPS-009 | A capacity planning approach is documented | info | automatic |

---

## Totals

- 7 phases, **62 checks** (up from 12 today).
- Automatic: 52. Manual: 10.
- Critical: 13. High: 26. Medium: 15. Info: 8.

## Open items before Milestone 2 implementation

1. Reconcile Engineering's `ENG-*` matrix ids with the ids already shipped
   in `src/audit/checks/engineering.ts` (Milestone 1, e.g.
   `structure/package-json`) — either rename shipped ids to match or update
   this doc, don't diverge silently. Lowest priority since Engineering
   already shipped; revisit if/when Engineering gets touched again.
2. Write full [AUDIT_SPEC.md](AUDIT_SPEC.md)-conformant records
   (why/evidence/pass/fail/remediation/references) for each check —
   authored per-phase, in the order the phase is actually implemented, not
   all 62 upfront. Discovery's checks carry `evidence`/`remediation`
   informally in code comments/messages, not as separate spec-record
   files yet — still an open item even for the shipped phase.
3. ~~Decide how `manual_review` surfaces in `CheckStatus` / `AuditReport`~~
   — done in v0.6: `CheckStatus` gained `'manual_review'`, scoring
   (`computeScore`/`computePhaseScores`) excludes it same as `skip`, and
   the report has a dedicated "Needs Review" section plus a
   `needsReview` count on `AuditReport`. Next packs with manual checks
   (Architecture, Security, Quality, Delivery) reuse this as-is.

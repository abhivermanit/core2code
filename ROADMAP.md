# Core2Code Roadmap

## Vision

Core2Code is a **production engineering audit and governance platform** that
helps developers turn AI-generated applications into production-ready
software. It scaffolds projects and audits them — but the audit is the
long-term product: it exists to answer one question:

> **Can this application safely go to production?**

Core2Code is not another AI coding assistant, low-code platform, or linter.
It's a production readiness framework and quality gate that sits after AI
(or human) code generation and before deploy.

## Target users

- Primary: AI-assisted developers, solo developers, freelancers
- Secondary: startups, small engineering teams

## Long-term workflow

```
Idea → AI generates application → Core2Code Audit → Engineering Report
  → Developer/AI fixes issues → Re-Audit → Production Ready → Deploy
```

## Audit lifecycle phases

The audit engine evaluates seven phases, Discovery through Operations. See
[README.md](README.md#audit) for the phase table and current scoring model.

## Milestones

### Milestone 1 — Stabilize CLI, audit engine architecture — ✅ Done (v0.5.0)

- Introduced `AuditPhase` as a first-class concept alongside the existing
  `AuditCategory`.
- Split checks into a `src/audit/checks/` registry, phase-tagged.
- Added `computePhaseScores` / `computeOverallReadiness` — phases with no
  checks report `N/A`, not 0%, and are excluded from the overall average.
- Added a "Production Readiness" banner to the terminal report and
  `phaseScores` / `readyForProduction` to the JSON output.
- Existing 12 checks re-homed into Engineering (11) and Quality (1) phases;
  no new checks added.
- Engine frozen after this milestone — no new checks land until the audit
  matrix (below) is designed.

### Pre-Milestone-2 — Design the audit matrix — ✅ Done

Full matrix defined in [docs/AUDIT_MATRIX.md](docs/AUDIT_MATRIX.md): 62
checks across 7 phases, each with a severity tier and an Automatic/Manual
type. Two governing decisions from CTO review:

- **Evidence, not filenames.** Checks describe what evidence satisfies them
  (e.g. "a decision record exists"), not a specific Core2Code template path
  — so the audit works on repos that never used Core2Code to scaffold.
- **Automatic vs. Manual is a hard split.** Automatic checks answer a binary,
  mechanically-verifiable question and resolve to pass/fail. Manual checks
  ask a quality/soundness question a tool can't reliably infer (e.g. "is
  this threat model actually complete") and always resolve to
  `manual_review` — never faked as an automated pass/fail.

### Pre-Milestone-2 — Freeze the audit specification — ✅ Done

[docs/AUDIT_SPEC.md](docs/AUDIT_SPEC.md) freezes the per-check record format
(id/title/phase/severity/type/why/evidence/pass/fail/manual_review/
remediation/references) — the API contract every check, current or future,
must conform to. Checks become data written against this spec, not
one-off code. IDs follow `<PHASE-CODE>-<NNN>` (e.g. `SEC-001`); matrix ids
were renumbered to match.

Remaining prep work (tracked in the matrix doc's Open Items, not blocking
Milestone 2 kickoff): write full spec-conformant records per check —
authored per-phase as each phase is implemented, not all 62 upfront — and
design how `manual_review` fits into `CheckStatus`/`AuditReport` when
Discovery (the first phase with manual checks) is implemented.

### Milestone 2 — Implement the audit matrix, shipped vertically by phase

Per CTO decision: don't implement all 62 checks in one release. Ship one
phase per minor version so users get value every release instead of waiting
for one large one. Each release: write that phase's spec-conformant check
records, implement them in `src/audit/checks/`, extend the engine only as
that phase's checks require (e.g. `manual_review` status support lands with
Discovery, since it's the first phase with manual checks).

- **v0.6 — Discovery** (7 checks: DISC-001..007)
- **v0.7 — Architecture** (9 checks: ARCH-001..009)
- **v0.8 — Security** (11 checks: SEC-001..011)
- **v0.9 — Quality** (8 checks: QUAL-001..008)
- **v1.0 — Delivery + Operations + Production Readiness Certification**
  (8 + 9 = 17 checks: DEL-001..008, OPS-001..009, plus a formal
  "certified production ready" report/badge once all 7 phases are scored)

Engineering (already shipped, 10 checks in the matrix vs. 12 shipped) gets
reconciled opportunistically, not as its own release — see matrix Open Item 1.

### Milestone 3 — Deepen scoring

Revisit severity-weighted scoring (critical/high/medium/info, not just
error/warn/info) now that real data exists across all 7 phases.

### Milestone 4 — AI-assisted remediation guidance

Automated fix recommendations per failed check, using each record's
`remediation` field as the starting point.

### Milestone 5 — CI/CD integration, GitHub Action, VS Code extension, SaaS dashboard

## Success metric

Developers stop asking "did AI generate good code?" and start asking "has
Core2Code certified this application as production-ready?"

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

Full matrix defined in [docs/AUDIT_MATRIX.md](docs/AUDIT_MATRIX.md): 50
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

Remaining prep work (tracked in the doc's Open Items, not blocking
Milestone 2 kickoff): write full why-it-matters/evidence/remediation
records per check, and design how `manual_review` fits into
`CheckStatus`/`AuditReport` when that engine change actually happens.

### Milestone 2 — Engineering lifecycle audits (Discovery → Operations)

Implement the checks defined by the audit matrix, phase by phase.

### Milestone 3 — Security and architecture analysis, production readiness scoring

Deeper Security/Architecture checks; revisit scoring (e.g. severity-weighted
points, not just flat pass/fail) now that real data exists across phases.

### Milestone 4 — AI-assisted remediation guidance

Automated fix recommendations per failed check.

### Milestone 5 — CI/CD integration, GitHub Action, VS Code extension, SaaS dashboard

## Success metric

Developers stop asking "did AI generate good code?" and start asking "has
Core2Code certified this application as production-ready?"

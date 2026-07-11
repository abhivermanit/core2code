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

### Pre-Milestone-2 — Design the audit matrix — 🔄 In progress

For each of the 7 phases, define: what's being audited, how many checks, and
each check's severity tier (Critical / High / Medium / Informational). This
matrix is the product's core IP and is expected to stay stable for years —
worth getting right before writing check code. Tracked as a design doc, not
code.

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

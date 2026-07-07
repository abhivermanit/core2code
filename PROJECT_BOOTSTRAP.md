# Project Bootstrap

Everything that must exist before writing the first line of code.

This is the entry point for every new application. Complete these steps in order before development begins.

---

## Phase 1 — Define the Problem

- [ ] **PRD completed** — Problem statement, goals, success metrics, user personas, scope defined
- [ ] **User stories written** — Prioritized with acceptance criteria
- [ ] **NFRs documented** — Performance, security, availability, scalability targets set

## Phase 2 — Design the Solution

- [ ] **Architecture approved** — Components, data flow, interfaces defined and reviewed
- [ ] **Threat model completed** — Assets identified, threats enumerated (STRIDE), mitigations planned
- [ ] **Data model finalized** — Entities, relationships, indexes, migration strategy documented
- [ ] **API contract defined** — Endpoints, request/response schemas, error format, versioning
- [ ] **UI wireframes ready** (if applicable) — Key screens and flows validated with stakeholders

## Phase 3 — Set Up the Foundation

- [ ] **Tech stack selected** — Language, framework, database, hosting decisions documented with rationale
- [ ] **Repository initialized** — Git repo created, default branch protected
- [ ] **Folder structure generated** — Matches architecture; follows project conventions
- [ ] **AI rules added** — `CLAUDE.md` and/or `AGENTS.md` configured with project context
- [ ] **Coding standards configured** — Linter, formatter, pre-commit hooks in place
- [ ] **Dependency baseline** — Core dependencies installed, lockfile committed

## Phase 4 — Configure Operations

- [ ] **CI/CD configured** — Pipeline runs lint, typecheck, tests, build on every PR
- [ ] **Secrets configured** — Vault/secrets manager set up; `.env.example` committed
- [ ] **Environments defined** — Dev, staging, production with separate configs
- [ ] **Monitoring ready** — Logging, metrics, alerting configured (even if minimal)
- [ ] **Deployment pipeline tested** — At least one successful deploy to staging

## Phase 5 — Confirm Readiness

- [ ] **Definition of Done agreed** — Team knows what "done" means
- [ ] **Checklists available** — Code review, deployment, security checklists accessible
- [ ] **Rollback plan documented** — Team knows how to revert a bad deploy
- [ ] **On-call / support plan** — Someone is responsible if production breaks

---

## Development Can Begin

Only after all applicable items above are checked should feature development start.

This prevents:
- Architecture changes mid-sprint
- Security gaps discovered late
- Integration surprises at deployment
- "It works on my machine" issues
- Missing observability when debugging production

---

## How to Use This File

1. Copy this file into your new project repository.
2. Check off items as they're completed.
3. Get sign-off from the tech lead before starting development.
4. Reference it during retrospectives to identify process gaps.

Not every project needs every item — but every item should be consciously decided as "needed" or "not applicable" rather than skipped by default.

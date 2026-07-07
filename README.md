# core2code

An engineering operating system for building production-grade applications.

Organized around **engineering responsibility** — not documents. Every folder answers a specific question about how to ship software that works.

## Structure

```
core2code/
│
├── README.md
├── CLAUDE.md                    ← Universal AI engineering directives
├── PROJECT_BOOTSTRAP.md         ← Entry point for every new project
│
├── 00-foundation/               ← Never changes. Principles and standards.
│   ├── engineering-principles.md
│   ├── engineering-directives.md
│   ├── coding-standards.md
│   ├── definition-of-done.md
│   └── decision-framework.md
│
├── 01-discovery/                ← Before architecture: understand the problem.
│   ├── prd.md
│   ├── user-stories.md
│   ├── non-functional-requirements.md
│   ├── constraints.md
│   ├── assumptions.md
│   └── risks.md
│
├── 02-architecture/             ← Design the solution before building it.
│   ├── architecture.md
│   ├── system-context.md
│   ├── component-diagram.md
│   ├── sequence-diagrams.md
│   ├── data-model.md
│   ├── api-design.md
│   ├── authentication.md
│   ├── authorization.md
│   ├── event-flows.md
│   ├── integrations.md
│   ├── tech-stack.md
│   ├── storage.md
│   ├── caching.md
│   ├── background-jobs.md
│   ├── deployment-architecture.md
│   └── threat-model.md
│
├── 03-engineering/              ← How we write and manage code.
│   ├── folder-structure.md
│   ├── dependency-policy.md
│   ├── git-workflow.md
│   ├── branching.md
│   ├── naming.md
│   ├── logging-standards.md
│   ├── error-handling.md
│   ├── configuration.md
│   ├── feature-flags.md
│   ├── ai-development.md
│   └── code-review.md
│
├── 04-security/                 ← Security as a first-class concern.
│   ├── owasp.md
│   ├── authentication-checklist.md
│   ├── authorization-checklist.md
│   ├── rls.md
│   ├── secrets.md
│   ├── dependency-security.md
│   ├── file-uploads.md
│   ├── api-security.md
│   ├── session-management.md
│   ├── rate-limiting.md
│   ├── audit-logging.md
│   └── incident-response.md
│
├── 05-quality/                  ← Testing is only part of quality.
│   ├── testing-strategy.md
│   ├── unit-testing.md
│   ├── integration-testing.md
│   ├── contract-testing.md
│   ├── api-testing.md
│   ├── security-testing.md
│   ├── performance-testing.md
│   ├── accessibility-testing.md
│   ├── responsive-testing.md
│   ├── cross-browser-testing.md
│   ├── mobile-testing.md
│   ├── chaos-testing.md
│   └── regression-testing.md
│
├── 06-delivery/                 ← Getting code to production safely.
│   ├── ci-cd.md
│   ├── deployment.md
│   ├── rollback.md
│   ├── feature-flags.md
│   ├── release-strategy.md
│   ├── environments.md
│   ├── versioning.md
│   ├── database-migrations.md
│   ├── backups.md
│   ├── monitoring.md
│   ├── logging.md
│   ├── tracing.md
│   └── alerts.md
│
├── 07-operations/               ← Running software in production.
│   ├── runbooks.md
│   ├── incident-management.md
│   ├── sla-slo.md
│   ├── maintenance.md
│   ├── cost-monitoring.md
│   ├── on-call.md
│   ├── postmortems.md
│   ├── disaster-recovery.md
│   └── capacity-planning.md
│
├── 08-playbooks/                ← Domain-specific guidance.
│   ├── build-a-saas.md
│   ├── build-an-ecommerce.md
│   ├── build-an-ai-chat-app.md
│   ├── build-a-crm.md
│   ├── build-a-marketplace.md
│   ├── build-a-mobile-app.md
│   ├── build-a-dashboard.md
│   ├── build-an-admin-panel.md
│   └── build-an-api.md
│
├── 09-checklists/               ← Nothing gets forgotten.
│   ├── architecture-checklist.md
│   ├── security-checklist.md
│   ├── deployment-checklist.md
│   ├── code-review-checklist.md
│   ├── release-checklist.md
│   ├── responsive-ui.md
│   ├── mobile-ready.md
│   ├── production-hardening.md  ← The single most important checklist
│   ├── database-review.md
│   └── dependency-review.md
│
├── 10-templates/                ← Copy into any new project.
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── THREAT_MODEL.md
│   ├── API_SPEC.md
│   ├── ADR.md
│   ├── TEST_PLAN.md
│   ├── INCIDENT_REPORT.md
│   ├── RUNBOOK.md
│   ├── DEPLOYMENT_PLAN.md
│   ├── RELEASE_NOTES.md
│   ├── POSTMORTEM.md
│   ├── CLAUDE.md
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── github-workflow.yml
│   ├── eslint.config.js
│   ├── prettier.config.js
│   └── .gitignore
│
└── assets/
    ├── diagrams/
    └── images/
```

## Philosophy

Production failures are rarely caused by missing code. They're caused by **missing engineering decisions**.

This repository ensures those decisions are made before the first line of code is written.

## How to Use

1. **New project?** Start with `PROJECT_BOOTSTRAP.md`.
2. **Need AI rules?** Copy `CLAUDE.md` or `10-templates/CLAUDE.md` into your repo.
3. **Building a SaaS?** Read `08-playbooks/build-a-saas.md` before architecting.
4. **Ready to ship?** Run through `09-checklists/production-hardening.md`.
5. **Incident?** Use `10-templates/INCIDENT_REPORT.md` and `07-operations/incident-management.md`.

## Guiding Principle

> Features are optional.
>
> Security, reliability, observability, maintainability, and operational readiness are mandatory.

## License

MIT

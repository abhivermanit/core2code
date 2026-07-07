# core2code

A structured framework for taking software from core principles to production code. Templates, checklists, and standards for engineering teams.

## Structure

```
core2code/
│
├── 00-principles/          Engineering principles and standards
│   ├── engineering-principles.md
│   ├── coding-standards.md
│   └── definition-of-done.md
│
├── 01-product/             Product requirements and user stories
│   ├── PRD-template.md
│   ├── user-stories.md
│   └── acceptance-criteria.md
│
├── 02-architecture/        System design and architecture
│   ├── architecture-template.md
│   ├── system-design.md
│   ├── data-model.md
│   ├── api-design.md
│   └── threat-model.md
│
├── 03-non-functional/      NFRs: security, performance, etc.
│   ├── non-functional-requirements.md
│   ├── security.md
│   ├── scalability.md
│   ├── performance.md
│   ├── observability.md
│   └── reliability.md
│
├── 04-development/         Development workflow and standards
│   ├── project-rules.md
│   ├── ai-development-workflow.md
│   ├── git-workflow.md
│   └── branching-strategy.md
│
├── 05-testing/             Testing strategy and guidelines
│   ├── testing-strategy.md
│   ├── security-testing.md
│   ├── performance-testing.md
│   └── accessibility.md
│
├── 06-devops/              Deployment and infrastructure
│   ├── deployment.md
│   ├── ci-cd.md
│   ├── rollback.md
│   └── infrastructure.md
│
├── 07-checklists/          Ready-to-use checklists
│   ├── architecture-checklist.md
│   ├── security-checklist.md
│   ├── deployment-checklist.md
│   ├── code-review-checklist.md
│   └── release-checklist.md
│
├── 08-templates/           Copy-paste templates for projects
│   ├── CLAUDE.md
│   ├── AGENTS.md
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── THREAT_MODEL.md
│   ├── DATA_MODEL.md
│   └── .env.example
│
└── assets/
    ├── diagrams/
    └── images/
```

## Usage

1. Clone this repo into your project (or reference it).
2. Copy templates from `08-templates/` into your project root.
3. Use checklists from `07-checklists/` during development.
4. Reference standards from `00-principles/` for consistency.
5. Adapt to your team's needs — these are starting points, not rigid rules.

## Philosophy

- **Principles before process** — Understand why before following how.
- **Templates are starting points** — Adapt them to your context.
- **Checklists prevent mistakes** — Use them consistently.
- **Standards enable autonomy** — When everyone knows the rules, less coordination is needed.

## License

MIT

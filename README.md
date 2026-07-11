# create-core2code

> Scaffold a new project using the **Core2Code** engineering framework — an
> engineering operating system for building production-grade applications.

## Quick Start

```bash
# Interactive wizard (recommended)
npx create-core2code

# Non-interactive with name and stacks
npx create-core2code my-app --react --express --postgres --yes
```

## Usage

```
Usage: create-core2code [project-name] [options]

Scaffold a new project using the Core2Code engineering framework.

Options:
  -v, --version        output the version number
  --no-git             skip git repository initialization
  -f, --force          overwrite the target directory if it already exists
  -y, --yes            skip interactive prompts and use defaults
  --react              include React frontend stack
  --nextjs             include Next.js full-stack
  --express            include Express backend stack
  --fastify            include Fastify backend stack
  --postgres           include PostgreSQL database stack
  --mongodb            include MongoDB database stack
  --docker             include Docker infrastructure stack
  --github-actions     include GitHub Actions CI/CD stack
  -h, --help           display help for command
```

## Interactive Wizard

When run without `--yes`, the CLI launches an interactive wizard that guides you
through selecting a project name and technology stacks:

```
? Project name: my-saas-app
? Frontend: React — React SPA with TypeScript and Vite
? Backend: Express — Express.js REST API with TypeScript
? Database: PostgreSQL — PostgreSQL with migrations and connection pooling
? Infrastructure: Docker — Dockerfile, docker-compose, and multi-stage builds

✔ Created my-saas-app at /path/to/my-saas-app
  Stacks: react, express, postgres, docker
```

## Available Stacks

| Key | Category | Description |
| --- | --- | --- |
| `react` | Frontend | React SPA with TypeScript and Vite |
| `nextjs` | Frontend | Full-stack React with Next.js App Router |
| `express` | Backend | Express.js REST API with TypeScript |
| `fastify` | Backend | Fastify API with schema validation |
| `postgres` | Database | PostgreSQL with migrations and connection pooling |
| `mongodb` | Database | MongoDB with Mongoose ODM |
| `docker` | Infra | Dockerfile, docker-compose, and multi-stage builds |
| `github-actions` | Infra | CI/CD pipeline with GitHub Actions |

## Audit

`create-core2code audit` scans an existing project and reports a **production
readiness** score across the software engineering lifecycle, not just repo
hygiene.

```bash
npx create-core2code audit [path]      # human-readable report
npx create-core2code audit [path] --json   # machine-readable, for CI
npx create-core2code audit [path] --verbose
```

Checks are organized into seven lifecycle **phases**, run in this order:

| Phase | What it covers |
| --- | --- |
| Discovery | Vision, problem statement, scope, requirements, risks |
| Architecture | Architecture docs, ADRs, auth design, data model, API contracts, threat model |
| Engineering | Project structure, coding standards, configuration, dependency policy |
| Security | AuthN/AuthZ, secrets, rate limiting, input validation, OWASP controls |
| Quality | Unit/integration/API/security/performance/accessibility tests |
| Delivery | CI/CD, environments, SSL, rollback, migrations, versioning |
| Operations | Monitoring, logging, alerts, backups, disaster recovery, cost |

Each phase gets its own score; a phase with no checks registered yet reports
`N/A` rather than 0% (it hasn't been evaluated, not failed). The **Overall**
score averages only the phases that have been evaluated, and a project is
flagged `✔ Production Ready` once that average crosses the readiness
threshold (80%).

Not every check can be answered automatically. Some ask a quality/soundness
question (is the scope well-bounded, is the problem statement specific) that
a tool can't reliably judge — those are `manual` checks and always show up
under a **Needs Review** section instead of being silently scored pass/fail.
Security checks add a related case: several can only prove a positive (a
recognized auth/validation/rate-limiting library or code pattern found) —
finding nothing isn't proof the practice is missing, just that this scan
didn't recognize a hand-rolled implementation, so those also land in Needs
Review rather than a false fail. See [docs/AUDIT_SPEC.md](docs/AUDIT_SPEC.md)
for the automatic-vs-manual check format and the manual_review-on-inconclusive
rule.

```
Production Readiness

  Discovery       86%
  Architecture    83%
  Engineering     91%
  Security        90%
  Quality        100%
  Delivery       N/A
  Operations     N/A

Overall: 90%
✔ Production Ready

Needs Review
  ◐ Scope (in/out) is explicitly bounded
    Confirm the project explicitly states what is in scope and out of scope...
    → Add an explicit "Scope" / "Out of scope" section to the PRD or README.
  ◐ Rate limiting is present on public endpoints
    No recognized rate-limiting dependency or code pattern found.
    → Add rate limiting to public/unauthenticated endpoints to protect against abuse.
```

As of v0.8.0, checks are implemented for the **Discovery**, **Architecture**,
**Engineering**, **Security**, and **Quality** phases (40 checks total: 7
Discovery, 9 Architecture, 11 Engineering, 12 Security, 1 Quality). The other
two phases are registered in the engine but intentionally empty; each ships
as its own "Audit Pack" — see [ROADMAP.md](ROADMAP.md) for the release plan
and [docs/AUDIT_MATRIX.md](docs/AUDIT_MATRIX.md) for the full 63-check design.

The audit exits non-zero if any `error`-severity check fails, so it can gate CI.

## Programmatic API

```typescript
import { generateProject, buildProjectConfig, createSilentLogger } from 'create-core2code';

const config = buildProjectConfig({
  projectName: 'my-app',
  stacks: ['react', 'express'],
});

const result = await generateProject({
  config,
  logger: createSilentLogger(),
});

console.log(result.projectPath);
console.log(result.stacks); // ['react', 'express']
```

## License

Apache-2.0

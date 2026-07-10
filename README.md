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

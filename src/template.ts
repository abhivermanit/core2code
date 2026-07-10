import { PLACEHOLDERS } from './constants';
import { listFilesRecursively, replaceInFile } from './filesystem';
import type { TemplateContext } from './types';

export function createTemplateContext(
  projectName: string,
  now: Date = new Date(),
): TemplateContext {
  return {
    PROJECT_NAME: projectName,
    CURRENT_YEAR: String(now.getFullYear()),
    CURRENT_DATE: now.toISOString().slice(0, 10),
  };
}

export function buildReplacements(context: TemplateContext): Map<string, string> {
  return new Map<string, string>([
    [PLACEHOLDERS.PROJECT_NAME, context.PROJECT_NAME],
    [PLACEHOLDERS.CURRENT_YEAR, context.CURRENT_YEAR],
    [PLACEHOLDERS.CURRENT_DATE, context.CURRENT_DATE],
  ]);
}

export function renderString(content: string, context: TemplateContext): string {
  let output = content;
  for (const [token, value] of buildReplacements(context)) {
    output = output.split(token).join(value);
  }
  return output;
}

export async function applyContextToTree(
  root: string,
  context: TemplateContext,
): Promise<number> {
  const replacements = buildReplacements(context);
  const files = await listFilesRecursively(root);
  let modified = 0;
  for (const file of files) {
    const changed = await replaceInFile(file, replacements);
    if (changed) {
      modified += 1;
    }
  }
  return modified;
}

export function renderProjectReadme(context: TemplateContext): string {
  const template = `# {{PROJECT_NAME}}

> Bootstrapped with the **Core2Code** engineering framework — an engineering
> operating system for building production-grade applications.

## Getting Started

\`\`\`bash
# install dependencies (once a stack is chosen)
# npm install

# read the bootstrap checklist before writing code
open PROJECT_BOOTSTRAP.md
\`\`\`

## What's in here

This project ships with the full Core2Code framework so engineering decisions
are made *before* the first line of application code:

| Path | Purpose |
| --- | --- |
| \`PROJECT_BOOTSTRAP.md\` | Entry point — everything that must exist before coding. |
| \`00-foundation/\` | Principles, coding standards, definition of done. |
| \`01-discovery/\` | PRD, user stories, NFRs, constraints, risks. |
| \`02-architecture/\` | Architecture, data model, API design, threat model. |
| \`03-engineering/\` | Git workflow, error handling, logging, configuration. |
| \`04-security/\` | OWASP, auth, secrets, rate limiting, audit logging. |
| \`05-quality/\` | Testing strategy across unit → chaos. |
| \`06-delivery/\` | CI/CD, deployment, rollback, monitoring. |
| \`07-operations/\` | Runbooks, incident management, SLA/SLO, DR. |
| \`08-playbooks/\` | Domain guides (SaaS, API, marketplace, ...). |
| \`09-checklists/\` | \`production-hardening.md\` is the one that matters most. |
| \`10-templates/\` | Copy-ready docs and configs (Dockerfile, CI, .env.example). |
| \`CORE2CODE.md\` | Full framework overview and index. |

## For AI assistants

Read \`CLAUDE.md\` and \`AGENTS.md\` at the project root before making changes.
Security is a gate, not a step: check \`04-security/\` and
\`09-checklists/security-checklist.md\` for any code touching input, auth, data
access, files, or outbound requests.

## Before shipping

Work through \`09-checklists/production-hardening.md\`. Treat unchecked items as
blocking or explicitly justify why they are not applicable.

---

Generated on {{CURRENT_DATE}} · © {{CURRENT_YEAR}} {{PROJECT_NAME}}
`;

  return renderString(template, context);
}

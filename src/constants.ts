import path from 'path';
import { StackCategory, StackDefinition } from './types';

/**
 * Root directory of the package (one level above dist/).
 */
export const PACKAGE_ROOT = path.resolve(__dirname, '..');

/**
 * Path to the template directory.
 */
export const TEMPLATE_DIR = path.join(PACKAGE_ROOT, 'template');

/**
 * Pattern for validating project names.
 */
export const NAME_PATTERN = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

/**
 * Maximum length of a project name.
 */
export const MAX_NAME_LENGTH = 214;

/**
 * All available stack definitions.
 */
export const STACKS: StackDefinition[] = [
  {
    key: 'react',
    category: 'frontend',
    label: 'React',
    description: 'React SPA with TypeScript and Vite',
    templateDir: 'frontend',
  },
  {
    key: 'nextjs',
    category: 'frontend',
    label: 'Next.js',
    description: 'Full-stack React with Next.js App Router',
    templateDir: 'frontend',
  },
  {
    key: 'express',
    category: 'backend',
    label: 'Express',
    description: 'Express.js REST API with TypeScript',
    templateDir: 'backend',
  },
  {
    key: 'fastify',
    category: 'backend',
    label: 'Fastify',
    description: 'Fastify API with schema validation',
    templateDir: 'backend',
  },
  {
    key: 'postgres',
    category: 'database',
    label: 'PostgreSQL',
    description: 'PostgreSQL with migrations and connection pooling',
    templateDir: 'database',
  },
  {
    key: 'mongodb',
    category: 'database',
    label: 'MongoDB',
    description: 'MongoDB with Mongoose ODM',
    templateDir: 'database',
  },
  {
    key: 'docker',
    category: 'infra',
    label: 'Docker',
    description: 'Dockerfile, docker-compose, and multi-stage builds',
    templateDir: 'common',
  },
  {
    key: 'github-actions',
    category: 'infra',
    label: 'GitHub Actions',
    description: 'CI/CD pipeline with GitHub Actions',
    templateDir: 'common',
  },
];

/**
 * Map from stack key to stack definition for quick lookups.
 */
export const STACK_MAP: ReadonlyMap<string, StackDefinition> = new Map(
  STACKS.map((s) => [s.key, s]),
);

/**
 * All valid stack keys.
 */
export const VALID_STACK_KEYS: ReadonlySet<string> = new Set(
  STACKS.map((s) => s.key),
);

/**
 * Ordered list of categories for prompting.
 */
export const CATEGORY_ORDER: StackCategory[] = [
  'frontend',
  'backend',
  'database',
  'infra',
];

/**
 * Category display labels.
 */
export const CATEGORY_LABELS: Record<StackCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  infra: 'Infrastructure',
};

/**
 * Retrieve a stack definition by key or throw.
 */
export function getStackDefinition(key: string): StackDefinition {
  const def = STACK_MAP.get(key);
  if (!def) {
    throw new Error(`Unknown stack key: ${key}`);
  }
  return def;
}

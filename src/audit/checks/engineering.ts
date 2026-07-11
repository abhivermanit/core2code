/**
 * Engineering phase checks: project structure, coding standards,
 * configuration, and dependency policy.
 */

import path from 'path';
import fs from 'fs-extra';
import { AuditCheck, AuditContext } from '../types';
import { pass, fail, skip } from './helpers';

const PHASE = 'engineering';

// --- Structure ---

const packageJsonExists: AuditCheck = {
  id: 'structure/package-json',
  label: 'package.json exists',
  category: 'structure',
  phase: PHASE,
  severity: 'error',
  run(ctx: AuditContext) {
    if (ctx.packageJson) {
      return pass(this.id, this.label, this.phase, 'package.json found');
    }
    return fail(this.id, this.label, this.phase, 'error', 'Missing package.json in project root');
  },
};

const srcDirExists: AuditCheck = {
  id: 'structure/src-dir',
  label: 'src/ directory exists',
  category: 'structure',
  phase: PHASE,
  severity: 'warn',
  run(ctx: AuditContext) {
    if (ctx.rootFiles.includes('src')) {
      return pass(this.id, this.label, this.phase, 'src/ directory found');
    }
    return fail(this.id, this.label, this.phase, 'warn', 'No src/ directory found');
  },
};

const readmeExists: AuditCheck = {
  id: 'structure/readme',
  label: 'README.md exists',
  category: 'structure',
  phase: PHASE,
  severity: 'warn',
  run(ctx: AuditContext) {
    const hasReadme = ctx.rootFiles.some(
      (f) => f.toLowerCase() === 'readme.md' || f.toLowerCase() === 'readme',
    );
    if (hasReadme) {
      return pass(this.id, this.label, this.phase, 'README found');
    }
    return fail(this.id, this.label, this.phase, 'warn', 'No README.md found');
  },
};

// --- Config ---

const tsconfigExists: AuditCheck = {
  id: 'config/tsconfig',
  label: 'tsconfig.json exists',
  category: 'config',
  phase: PHASE,
  severity: 'warn',
  run(ctx: AuditContext) {
    if (ctx.hasTsConfig) {
      return pass(this.id, this.label, this.phase, 'tsconfig.json found');
    }
    return fail(this.id, this.label, this.phase, 'warn', 'No tsconfig.json found');
  },
};

const hasStrictMode: AuditCheck = {
  id: 'config/strict-mode',
  label: 'TypeScript strict mode',
  category: 'config',
  phase: PHASE,
  severity: 'warn',
  async run(ctx: AuditContext) {
    if (!ctx.hasTsConfig) {
      return skip(this.id, this.label, this.phase, 'No tsconfig.json to check');
    }
    const tsPath = path.join(ctx.projectDir, 'tsconfig.json');
    try {
      const content = await fs.readJson(tsPath);
      if (content?.compilerOptions?.strict === true) {
        return pass(this.id, this.label, this.phase, 'strict mode enabled');
      }
      return fail(this.id, this.label, this.phase, 'warn', 'strict mode not enabled in tsconfig.json');
    } catch {
      return skip(this.id, this.label, this.phase, 'Could not parse tsconfig.json');
    }
  },
};

// --- Git ---

const gitInitialized: AuditCheck = {
  id: 'git/initialized',
  label: 'Git repository initialized',
  category: 'git',
  phase: PHASE,
  severity: 'warn',
  run(ctx: AuditContext) {
    if (ctx.hasGit) {
      return pass(this.id, this.label, this.phase, 'Git repository initialized');
    }
    return fail(this.id, this.label, this.phase, 'warn', 'No .git directory found');
  },
};

const gitignoreExists: AuditCheck = {
  id: 'git/gitignore',
  label: '.gitignore exists',
  category: 'git',
  phase: PHASE,
  severity: 'warn',
  run(ctx: AuditContext) {
    if (ctx.rootFiles.includes('.gitignore')) {
      return pass(this.id, this.label, this.phase, '.gitignore found');
    }
    return fail(this.id, this.label, this.phase, 'warn', 'No .gitignore found');
  },
};

// --- Dependencies ---

const hasNameField: AuditCheck = {
  id: 'dependencies/name-field',
  label: 'package.json has name field',
  category: 'dependencies',
  phase: PHASE,
  severity: 'error',
  run(ctx: AuditContext) {
    if (!ctx.packageJson) {
      return skip(this.id, this.label, this.phase, 'No package.json to check');
    }
    if (typeof ctx.packageJson['name'] === 'string' && ctx.packageJson['name'].length > 0) {
      return pass(this.id, this.label, this.phase, `name: "${ctx.packageJson['name']}"`);
    }
    return fail(this.id, this.label, this.phase, 'error', 'package.json is missing "name" field');
  },
};

const hasScripts: AuditCheck = {
  id: 'dependencies/scripts',
  label: 'package.json has scripts',
  category: 'dependencies',
  phase: PHASE,
  severity: 'warn',
  run(ctx: AuditContext) {
    if (!ctx.packageJson) {
      return skip(this.id, this.label, this.phase, 'No package.json to check');
    }
    const scripts = ctx.packageJson['scripts'];
    if (scripts && typeof scripts === 'object' && Object.keys(scripts).length > 0) {
      return pass(this.id, this.label, this.phase, `${Object.keys(scripts).length} script(s) defined`);
    }
    return fail(this.id, this.label, this.phase, 'warn', 'No scripts defined in package.json');
  },
};

const noMissingEngines: AuditCheck = {
  id: 'dependencies/engines',
  label: 'Node engines specified',
  category: 'dependencies',
  phase: PHASE,
  severity: 'info',
  run(ctx: AuditContext) {
    if (!ctx.packageJson) {
      return skip(this.id, this.label, this.phase, 'No package.json to check');
    }
    const engines = ctx.packageJson['engines'];
    if (engines && typeof engines === 'object') {
      return pass(this.id, this.label, this.phase, 'engines field specified');
    }
    return fail(this.id, this.label, this.phase, 'info', 'No engines field in package.json');
  },
};

// --- Coding standards ---

const hasLintConfig: AuditCheck = {
  id: 'quality/lint-config',
  label: 'Linting configuration present',
  category: 'quality',
  phase: PHASE,
  severity: 'info',
  run(ctx: AuditContext) {
    const lintFiles = [
      '.eslintrc',
      '.eslintrc.js',
      '.eslintrc.json',
      '.eslintrc.yml',
      '.eslintrc.yaml',
      'eslint.config.js',
      'eslint.config.mjs',
      'eslint.config.ts',
      'biome.json',
    ];
    const hasLint = ctx.rootFiles.some((f) => lintFiles.includes(f));
    if (hasLint) {
      return pass(this.id, this.label, this.phase, 'Lint configuration found');
    }
    return fail(this.id, this.label, this.phase, 'info', 'No linting config found (eslint, biome, etc.)');
  },
};

/**
 * All Engineering phase checks.
 */
export const ENGINEERING_CHECKS: AuditCheck[] = [
  packageJsonExists,
  srcDirExists,
  readmeExists,
  tsconfigExists,
  hasStrictMode,
  gitInitialized,
  gitignoreExists,
  hasNameField,
  hasScripts,
  noMissingEngines,
  hasLintConfig,
];

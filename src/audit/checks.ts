/**
 * Audit check implementations.
 */

import path from 'path';
import fs from 'fs-extra';
import { AuditCheck, AuditContext, CheckResult, Severity } from './types';

function pass(id: string, label: string, message: string): CheckResult {
  return { id, label, status: 'pass', severity: 'info', message };
}

function fail(id: string, label: string, severity: Severity, message: string): CheckResult {
  return { id, label, status: 'fail', severity, message };
}

function skip(id: string, label: string, message: string): CheckResult {
  return { id, label, status: 'skip', severity: 'info', message };
}

// --- Structure Checks ---

const packageJsonExists: AuditCheck = {
  id: 'structure/package-json',
  label: 'package.json exists',
  category: 'structure',
  severity: 'error',
  run(ctx: AuditContext) {
    if (ctx.packageJson) {
      return pass(this.id, this.label, 'package.json found');
    }
    return fail(this.id, this.label, 'error', 'Missing package.json in project root');
  },
};

const srcDirExists: AuditCheck = {
  id: 'structure/src-dir',
  label: 'src/ directory exists',
  category: 'structure',
  severity: 'warn',
  run(ctx: AuditContext) {
    if (ctx.rootFiles.includes('src')) {
      return pass(this.id, this.label, 'src/ directory found');
    }
    return fail(this.id, this.label, 'warn', 'No src/ directory found');
  },
};

const readmeExists: AuditCheck = {
  id: 'structure/readme',
  label: 'README.md exists',
  category: 'structure',
  severity: 'warn',
  run(ctx: AuditContext) {
    const hasReadme = ctx.rootFiles.some(
      (f) => f.toLowerCase() === 'readme.md' || f.toLowerCase() === 'readme',
    );
    if (hasReadme) {
      return pass(this.id, this.label, 'README found');
    }
    return fail(this.id, this.label, 'warn', 'No README.md found');
  },
};

// --- Config Checks ---

const tsconfigExists: AuditCheck = {
  id: 'config/tsconfig',
  label: 'tsconfig.json exists',
  category: 'config',
  severity: 'warn',
  run(ctx: AuditContext) {
    if (ctx.hasTsConfig) {
      return pass(this.id, this.label, 'tsconfig.json found');
    }
    return fail(this.id, this.label, 'warn', 'No tsconfig.json found');
  },
};

const hasStrictMode: AuditCheck = {
  id: 'config/strict-mode',
  label: 'TypeScript strict mode',
  category: 'config',
  severity: 'warn',
  async run(ctx: AuditContext) {
    if (!ctx.hasTsConfig) {
      return skip(this.id, this.label, 'No tsconfig.json to check');
    }
    const tsPath = path.join(ctx.projectDir, 'tsconfig.json');
    try {
      const content = await fs.readJson(tsPath);
      if (content?.compilerOptions?.strict === true) {
        return pass(this.id, this.label, 'strict mode enabled');
      }
      return fail(this.id, this.label, 'warn', 'strict mode not enabled in tsconfig.json');
    } catch {
      return skip(this.id, this.label, 'Could not parse tsconfig.json');
    }
  },
};

// --- Git Checks ---

const gitInitialized: AuditCheck = {
  id: 'git/initialized',
  label: 'Git repository initialized',
  category: 'git',
  severity: 'warn',
  run(ctx: AuditContext) {
    if (ctx.hasGit) {
      return pass(this.id, this.label, 'Git repository initialized');
    }
    return fail(this.id, this.label, 'warn', 'No .git directory found');
  },
};

const gitignoreExists: AuditCheck = {
  id: 'git/gitignore',
  label: '.gitignore exists',
  category: 'git',
  severity: 'warn',
  run(ctx: AuditContext) {
    if (ctx.rootFiles.includes('.gitignore')) {
      return pass(this.id, this.label, '.gitignore found');
    }
    return fail(this.id, this.label, 'warn', 'No .gitignore found');
  },
};

// --- Dependencies Checks ---

const hasNameField: AuditCheck = {
  id: 'dependencies/name-field',
  label: 'package.json has name field',
  category: 'dependencies',
  severity: 'error',
  run(ctx: AuditContext) {
    if (!ctx.packageJson) {
      return skip(this.id, this.label, 'No package.json to check');
    }
    if (typeof ctx.packageJson['name'] === 'string' && ctx.packageJson['name'].length > 0) {
      return pass(this.id, this.label, `name: "${ctx.packageJson['name']}"`);
    }
    return fail(this.id, this.label, 'error', 'package.json is missing "name" field');
  },
};

const hasScripts: AuditCheck = {
  id: 'dependencies/scripts',
  label: 'package.json has scripts',
  category: 'dependencies',
  severity: 'warn',
  run(ctx: AuditContext) {
    if (!ctx.packageJson) {
      return skip(this.id, this.label, 'No package.json to check');
    }
    const scripts = ctx.packageJson['scripts'];
    if (scripts && typeof scripts === 'object' && Object.keys(scripts).length > 0) {
      return pass(this.id, this.label, `${Object.keys(scripts).length} script(s) defined`);
    }
    return fail(this.id, this.label, 'warn', 'No scripts defined in package.json');
  },
};

const noMissingEngines: AuditCheck = {
  id: 'dependencies/engines',
  label: 'Node engines specified',
  category: 'dependencies',
  severity: 'info',
  run(ctx: AuditContext) {
    if (!ctx.packageJson) {
      return skip(this.id, this.label, 'No package.json to check');
    }
    const engines = ctx.packageJson['engines'];
    if (engines && typeof engines === 'object') {
      return pass(this.id, this.label, 'engines field specified');
    }
    return fail(this.id, this.label, 'info', 'No engines field in package.json');
  },
};

// --- Quality Checks ---

const hasLintConfig: AuditCheck = {
  id: 'quality/lint-config',
  label: 'Linting configuration present',
  category: 'quality',
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
      return pass(this.id, this.label, 'Lint configuration found');
    }
    return fail(this.id, this.label, 'info', 'No linting config found (eslint, biome, etc.)');
  },
};

const hasTestSetup: AuditCheck = {
  id: 'quality/test-setup',
  label: 'Test runner configured',
  category: 'quality',
  severity: 'info',
  run(ctx: AuditContext) {
    if (!ctx.packageJson) {
      return skip(this.id, this.label, 'No package.json to check');
    }

    const scripts = ctx.packageJson['scripts'] as Record<string, string> | undefined;
    if (scripts && (scripts['test'] || scripts['test:unit'] || scripts['test:watch'])) {
      return pass(this.id, this.label, 'Test script(s) found');
    }

    // Check for config files
    const testConfigs = ['vitest.config.ts', 'vitest.config.js', 'jest.config.ts', 'jest.config.js'];
    const hasTestConfig = ctx.rootFiles.some((f) => testConfigs.includes(f));
    if (hasTestConfig) {
      return pass(this.id, this.label, 'Test config file found');
    }

    return fail(this.id, this.label, 'info', 'No test runner configuration detected');
  },
};

/**
 * All built-in audit checks.
 */
export const ALL_CHECKS: AuditCheck[] = [
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
  hasTestSetup,
];

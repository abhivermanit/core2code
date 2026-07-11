/**
 * Shared result-builder helpers for audit check implementations.
 */

import fs from 'fs-extra';
import path from 'path';
import { AuditContext, AuditPhase, CheckResult, Severity } from '../types';

/** Minimum non-empty lines for a doc to count as "substantive" (existence-only guard, not quality checking). */
const MIN_SUBSTANTIVE_LINES = 5;

export function pass(id: string, label: string, phase: AuditPhase, message: string): CheckResult {
  return { id, label, status: 'pass', severity: 'info', phase, message };
}

export function fail(
  id: string,
  label: string,
  phase: AuditPhase,
  severity: Severity,
  message: string,
  remediation?: string,
): CheckResult {
  return { id, label, status: 'fail', severity, phase, message, remediation };
}

export function skip(id: string, label: string, phase: AuditPhase, message: string): CheckResult {
  return { id, label, status: 'skip', severity: 'info', phase, message };
}

/**
 * Result for a `manual`-type check (see AUDIT_SPEC.md) — always
 * manual_review, never a faked pass/fail.
 */
export function manualReview(
  id: string,
  label: string,
  phase: AuditPhase,
  severity: Severity,
  message: string,
  remediation: string,
): CheckResult {
  return { id, label, status: 'manual_review', severity, phase, message, remediation };
}

export interface EvidenceMatch {
  path: string;
  substantive: boolean;
}

/**
 * Look for a doc in ctx.docFiles whose relative path matches one of
 * `include` and none of `exclude`. Matching the full path (not just the
 * filename) means a directory name counts as evidence too — e.g. an ADR
 * living at docs/adr/0001-use-postgres.md matches /\badr\b/i via its
 * parent directory even though "adr" isn't in that filename. Returns the
 * first match with whether it clears a triviality bar (a few non-empty
 * lines) — this is an existence guard against literally-empty files, not
 * a semantic quality check.
 */
export async function findEvidenceDoc(
  ctx: AuditContext,
  include: RegExp[],
  exclude: RegExp[] = [],
): Promise<EvidenceMatch | null> {
  const match = ctx.docFiles.find((f) => {
    return include.some((re) => re.test(f)) && !exclude.some((re) => re.test(f));
  });
  if (!match) return null;

  try {
    const content = await fs.readFile(path.join(ctx.projectDir, match), 'utf-8');
    const nonEmptyLines = content.split('\n').filter((l) => l.trim().length > 0).length;
    return { path: match, substantive: nonEmptyLines >= MIN_SUBSTANTIVE_LINES };
  } catch {
    return { path: match, substantive: false };
  }
}

/** Skip reading source files larger than this when pattern-scanning (avoids loading huge bundles/generated code). */
const MAX_SOURCE_FILE_BYTES = 200_000;

/**
 * Test package.json dependencies/devDependencies keys against `patterns`.
 * Returns the matched dependency name, or null.
 */
export function hasDependency(ctx: AuditContext, patterns: RegExp[]): string | null {
  const pkg = ctx.packageJson;
  if (!pkg) return null;
  const deps = {
    ...((pkg['dependencies'] as Record<string, string>) ?? {}),
    ...((pkg['devDependencies'] as Record<string, string>) ?? {}),
  };
  const name = Object.keys(deps).find((dep) => patterns.some((re) => re.test(dep)));
  return name ?? null;
}

/**
 * Scan ctx.sourceFiles content for `patterns`. Returns the first matching
 * file's relative path, or null. Bounded by the caller-supplied
 * ctx.sourceFiles list (see context.ts's MAX_SOURCE_FILES/MAX_SOURCE_DEPTH)
 * and a per-file size cap here.
 */
export async function findSourcePattern(ctx: AuditContext, patterns: RegExp[]): Promise<string | null> {
  for (const file of ctx.sourceFiles) {
    const absPath = path.join(ctx.projectDir, file);
    try {
      const stat = await fs.stat(absPath);
      if (stat.size > MAX_SOURCE_FILE_BYTES) continue;
      const content = await fs.readFile(absPath, 'utf-8');
      if (patterns.some((re) => re.test(content))) return file;
    } catch {
      continue;
    }
  }
  return null;
}

export type CodeEvidence = { found: true; evidence: string } | { found: false };

/**
 * Look for code-level evidence of a practice: a known dependency first
 * (cheap), falling back to a source-code pattern scan (catches hand-rolled
 * implementations that don't use a named library). Used by Security checks
 * where "no evidence found" should be treated as inconclusive rather than
 * a confident absence — see docs/AUDIT_SPEC.md v1.1.
 */
export async function findCodeEvidence(
  ctx: AuditContext,
  dependencyPatterns: RegExp[],
  sourcePatterns: RegExp[],
): Promise<CodeEvidence> {
  const dep = hasDependency(ctx, dependencyPatterns);
  if (dep) return { found: true, evidence: `dependency "${dep}"` };
  const file = await findSourcePattern(ctx, sourcePatterns);
  if (file) return { found: true, evidence: file };
  return { found: false };
}

const SECRET_PATTERNS: RegExp[] = [
  /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
  /sk_live_[0-9a-zA-Z]{16,}/,
  /ghp_[0-9A-Za-z]{30,}/,
];

/** Generic "key = value"-style secret assignment, with a placeholder-value exclusion to cut false positives on templated examples. */
const GENERIC_SECRET_PATTERN = /(api[_-]?key|secret|password)\s*[:=]\s*['"]([A-Za-z0-9\-_]{16,})['"]/i;
const PLACEHOLDER_VALUE = /your-|xxx|example|changeme|<|>/i;

/**
 * Scan ctx.sourceFiles for high-confidence secret patterns, and check
 * that any root .env-style file is covered by .gitignore. Returns a
 * short description of what was found, or null if nothing suspicious.
 */
export async function scanForSecrets(ctx: AuditContext): Promise<string | null> {
  for (const file of ctx.sourceFiles) {
    const absPath = path.join(ctx.projectDir, file);
    try {
      const stat = await fs.stat(absPath);
      if (stat.size > MAX_SOURCE_FILE_BYTES) continue;
      const content = await fs.readFile(absPath, 'utf-8');
      if (SECRET_PATTERNS.some((re) => re.test(content))) {
        return `possible secret in ${file}`;
      }
      const generic = content.match(GENERIC_SECRET_PATTERN);
      if (generic && !PLACEHOLDER_VALUE.test(generic[2] ?? '')) {
        return `possible hardcoded credential in ${file}`;
      }
    } catch {
      continue;
    }
  }

  const envFiles = ctx.rootFiles.filter((f) => /^\.env(\..+)?$/.test(f));
  if (envFiles.length > 0) {
    const gitignore = ctx.gitignoreContent ?? '';
    const covered = envFiles.every((f) => gitignore.split('\n').some((line) => {
      const pattern = line.trim();
      if (!pattern || pattern.startsWith('#')) return false;
      return pattern === f || pattern === '.env*' || pattern === '.env' || f.startsWith(pattern.replace(/\*$/, ''));
    }));
    if (!covered) {
      return `${envFiles.join(', ')} not covered by .gitignore`;
    }
  }

  return null;
}

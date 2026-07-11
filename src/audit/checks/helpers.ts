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
 * Look for a doc in ctx.docFiles whose name matches one of `include` and
 * none of `exclude`. Returns the first match with whether it clears a
 * triviality bar (a few non-empty lines) — this is an existence guard
 * against literally-empty files, not a semantic quality check.
 */
export async function findEvidenceDoc(
  ctx: AuditContext,
  include: RegExp[],
  exclude: RegExp[] = [],
): Promise<EvidenceMatch | null> {
  const match = ctx.docFiles.find((f) => {
    const base = path.basename(f);
    return include.some((re) => re.test(base)) && !exclude.some((re) => re.test(base));
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

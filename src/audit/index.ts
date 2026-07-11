/**
 * Audit module – public API.
 */

export { buildAuditContext } from './context';
export { ALL_CHECKS } from './checks';
export { computeScore } from './score';
export { formatReport, formatReportJson } from './report';
export type {
  AuditCategory,
  AuditCheck,
  AuditCliOptions,
  AuditContext,
  AuditReport,
  AuditScore,
  CheckResult,
  CheckStatus,
  Severity,
} from './types';

import { AuditContext, AuditReport, CheckResult } from './types';
import { ALL_CHECKS } from './checks';
import { computeScore } from './score';
import { buildAuditContext } from './context';

/**
 * Run all audit checks against a project directory.
 */
export async function runAudit(projectDir: string): Promise<AuditReport> {
  const ctx: AuditContext = await buildAuditContext(projectDir);

  const results: CheckResult[] = [];
  for (const check of ALL_CHECKS) {
    const result = await check.run(ctx);
    results.push(result);
  }

  const score = computeScore(results);

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;

  return {
    projectDir: ctx.projectDir,
    timestamp: new Date().toISOString(),
    results,
    score,
    passed,
    failed,
    skipped,
  };
}

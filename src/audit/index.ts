/**
 * Audit module – public API.
 */

export { buildAuditContext } from './context';
export { ALL_CHECKS } from './checks';
export { computeScore, computePhaseScores, computeOverallReadiness } from './score';
export { formatReport, formatReportJson } from './report';
export { PHASE_ORDER, PHASE_LABELS, PRODUCTION_READY_THRESHOLD } from './phases';
export type {
  AuditCategory,
  AuditCheck,
  AuditCliOptions,
  AuditContext,
  AuditPhase,
  AuditReport,
  AuditScore,
  CheckResult,
  CheckStatus,
  PhaseScore,
  Severity,
} from './types';

import { AuditContext, AuditReport, CheckResult } from './types';
import { ALL_CHECKS } from './checks';
import { computeScore, computePhaseScores, computeOverallReadiness } from './score';
import { buildAuditContext } from './context';
import { PRODUCTION_READY_THRESHOLD } from './phases';

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
  const phaseScores = computePhaseScores(results);
  const overall = computeOverallReadiness(phaseScores);
  const readyForProduction = overall.percentage >= PRODUCTION_READY_THRESHOLD;

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;

  return {
    projectDir: ctx.projectDir,
    timestamp: new Date().toISOString(),
    results,
    score,
    phaseScores,
    readyForProduction,
    passed,
    failed,
    skipped,
  };
}

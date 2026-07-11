/**
 * Scoring logic for audit results.
 */

import { AuditScore, CheckResult, PhaseScore } from './types';
import { PHASE_ORDER, PHASE_LABELS } from './phases';

/** Points awarded per check status. */
const POINTS: Record<string, number> = {
  pass: 10,
  fail: 0,
  skip: 0,
  manual_review: 0,
};

/** Statuses that were never mechanically verified, so can't move a score. */
const UNSCORED_STATUSES = new Set(['skip', 'manual_review']);

/**
 * Determine a letter grade from a percentage score.
 */
function letterGrade(pct: number): string {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

/**
 * Calculate the audit score from check results.
 */
export function computeScore(results: CheckResult[]): AuditScore {
  // Only count mechanically-verified checks toward possible total
  const scored = results.filter((r) => !UNSCORED_STATUSES.has(r.status));

  const earned = scored.reduce((sum, r) => sum + (POINTS[r.status] ?? 0), 0);
  const possible = scored.length * (POINTS['pass'] ?? 0);

  const percentage = possible > 0 ? Math.round((earned / possible) * 100) : 100;
  const grade = letterGrade(percentage);

  return { earned, possible, percentage, grade };
}

/**
 * Calculate a per-phase score for each lifecycle phase in PHASE_ORDER.
 * Phases with no checks return `percentage`/`grade` of `null` (N/A) rather
 * than 0%, since an empty phase hasn't been evaluated at all.
 */
export function computePhaseScores(results: CheckResult[]): PhaseScore[] {
  return PHASE_ORDER.map((phase) => {
    const phaseResults = results.filter((r) => r.phase === phase);
    const scored = phaseResults.filter((r) => !UNSCORED_STATUSES.has(r.status));

    const earned = scored.reduce((sum, r) => sum + (POINTS[r.status] ?? 0), 0);
    const possible = scored.length * (POINTS['pass'] ?? 0);

    const checkCount = phaseResults.length;
    // Null (N/A) when nothing in this phase was mechanically verified,
    // even if manual/skip results exist — those don't count as "evaluated".
    const percentage = scored.length === 0 ? null : possible > 0 ? Math.round((earned / possible) * 100) : 100;
    const grade = percentage === null ? null : letterGrade(percentage);

    return {
      phase,
      label: PHASE_LABELS[phase],
      earned,
      possible,
      percentage,
      grade,
      checkCount,
    };
  });
}

/**
 * Average the percentage across phases that have at least one check,
 * excluding N/A phases so an unevaluated phase doesn't drag down the score.
 */
export function computeOverallReadiness(phaseScores: PhaseScore[]): { percentage: number; grade: string } {
  const evaluated = phaseScores.filter((p) => p.percentage !== null);
  if (evaluated.length === 0) {
    return { percentage: 100, grade: letterGrade(100) };
  }
  const percentage = Math.round(
    evaluated.reduce((sum, p) => sum + (p.percentage as number), 0) / evaluated.length,
  );
  return { percentage, grade: letterGrade(percentage) };
}

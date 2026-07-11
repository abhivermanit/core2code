/**
 * Scoring logic for audit results.
 */

import { AuditScore, CheckResult } from './types';

/** Points awarded per check status. */
const POINTS: Record<string, number> = {
  pass: 10,
  fail: 0,
  skip: 0,
};

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
  // Only count non-skipped checks toward possible total
  const scored = results.filter((r) => r.status !== 'skip');

  const earned = scored.reduce((sum, r) => sum + (POINTS[r.status] ?? 0), 0);
  const possible = scored.length * (POINTS['pass'] ?? 0);

  const percentage = possible > 0 ? Math.round((earned / possible) * 100) : 100;
  const grade = letterGrade(percentage);

  return { earned, possible, percentage, grade };
}

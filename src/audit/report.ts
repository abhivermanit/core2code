/**
 * Generate an audit report from check results.
 */

import pc from 'picocolors';
import { AuditReport, CheckResult } from './types';
import { computeOverallReadiness } from './score';
import { PHASE_LABELS } from './phases';

/**
 * Format the audit report for terminal output.
 */
export function formatReport(report: AuditReport, verbose: boolean): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(pc.bold(`Audit Report: ${report.projectDir}`));
  lines.push(pc.dim(`─`.repeat(60)));
  lines.push('');

  lines.push(pc.bold('  Production Readiness'));
  lines.push('');
  for (const p of report.phaseScores) {
    const label = p.label.padEnd(14);
    if (p.percentage === null) {
      lines.push(`    ${label} ${pc.dim('N/A')}`);
    } else {
      const color = p.percentage >= 80 ? pc.green : p.percentage >= 60 ? pc.yellow : pc.red;
      lines.push(`    ${label} ${color(`${p.percentage}%`.padStart(4))}`);
    }
  }
  const overall = computeOverallReadiness(report.phaseScores);
  const overallColor = overall.percentage >= 80 ? pc.green : overall.percentage >= 60 ? pc.yellow : pc.red;
  lines.push('');
  lines.push(`  Overall: ${overallColor(`${overall.percentage}%`)}`);
  lines.push(
    report.readyForProduction
      ? pc.green('  ✔ Production Ready')
      : pc.red('  ✖ Not Production Ready'),
  );
  lines.push('');
  lines.push(pc.dim(`─`.repeat(60)));
  lines.push('');

  // Group results by category prefix (falling back to phase label for
  // checks whose id doesn't carry a "category/" prefix, e.g. DISC-001)
  const categories = new Map<string, CheckResult[]>();
  for (const result of report.results) {
    const category = result.id.includes('/') ? result.id.split('/')[0]! : PHASE_LABELS[result.phase].toLowerCase();
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(result);
  }

  function icon(status: CheckResult['status']): string {
    if (status === 'pass') return pc.green('✔');
    if (status === 'fail') return pc.red('✖');
    if (status === 'manual_review') return pc.yellow('◐');
    return pc.dim('○');
  }

  function coloredLabel(r: CheckResult): string {
    if (r.status === 'fail') return pc.red(r.label);
    if (r.status === 'pass') return pc.green(r.label);
    if (r.status === 'manual_review') return pc.yellow(r.label);
    return pc.dim(r.label);
  }

  for (const [category, results] of categories) {
    lines.push(pc.bold(`  ${category.toUpperCase()}`));
    for (const r of results) {
      lines.push(`    ${icon(r.status)} ${coloredLabel(r)}`);
      if (verbose && r.message) {
        lines.push(`      ${pc.dim(r.message)}`);
      }
    }
    lines.push('');
  }

  // Needs Review — manual checks are never silently averaged into the
  // score; they're always surfaced explicitly here.
  const needsReview = report.results.filter((r) => r.status === 'manual_review');
  if (needsReview.length > 0) {
    lines.push(pc.dim(`─`.repeat(60)));
    lines.push(pc.bold(pc.yellow('  Needs Review')));
    lines.push('');
    for (const r of needsReview) {
      lines.push(`    ${pc.yellow('◐')} ${r.label}`);
      lines.push(`      ${pc.dim(r.message)}`);
      if (r.remediation) {
        lines.push(`      ${pc.dim(`→ ${r.remediation}`)}`);
      }
    }
    lines.push('');
  }

  // Summary
  lines.push(pc.dim(`─`.repeat(60)));
  const scoreColor = report.score.percentage >= 80 ? pc.green : report.score.percentage >= 60 ? pc.yellow : pc.red;
  lines.push(`  Score: ${scoreColor(`${report.score.percentage}%`)} (${report.score.grade})`);
  lines.push(
    `  Passed: ${pc.green(String(report.passed))}  Failed: ${pc.red(String(report.failed))}  Skipped: ${pc.dim(String(report.skipped))}  Needs Review: ${pc.yellow(String(report.needsReview))}`,
  );
  lines.push('');

  return lines.join('\n');
}

/**
 * Convert the report to a JSON string.
 */
export function formatReportJson(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

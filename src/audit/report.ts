/**
 * Generate an audit report from check results.
 */

import pc from 'picocolors';
import { AuditReport, CheckResult } from './types';

/**
 * Format the audit report for terminal output.
 */
export function formatReport(report: AuditReport, verbose: boolean): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(pc.bold(`Audit Report: ${report.projectDir}`));
  lines.push(pc.dim(`─`.repeat(60)));
  lines.push('');

  // Group results by category prefix
  const categories = new Map<string, CheckResult[]>();
  for (const result of report.results) {
    const category = result.id.split('/')[0] ?? 'other';
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(result);
  }

  for (const [category, results] of categories) {
    lines.push(pc.bold(`  ${category.toUpperCase()}`));
    for (const r of results) {
      const icon = r.status === 'pass' ? pc.green('✔') : r.status === 'fail' ? pc.red('✖') : pc.dim('○');
      const label = r.status === 'fail' ? pc.red(r.label) : r.status === 'pass' ? pc.green(r.label) : pc.dim(r.label);
      lines.push(`    ${icon} ${label}`);
      if (verbose && r.message) {
        lines.push(`      ${pc.dim(r.message)}`);
      }
    }
    lines.push('');
  }

  // Summary
  lines.push(pc.dim(`─`.repeat(60)));
  const scoreColor = report.score.percentage >= 80 ? pc.green : report.score.percentage >= 60 ? pc.yellow : pc.red;
  lines.push(`  Score: ${scoreColor(`${report.score.percentage}%`)} (${report.score.grade})`);
  lines.push(`  Passed: ${pc.green(String(report.passed))}  Failed: ${pc.red(String(report.failed))}  Skipped: ${pc.dim(String(report.skipped))}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Convert the report to a JSON string.
 */
export function formatReportJson(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

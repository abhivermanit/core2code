/**
 * Audit CLI subcommand handler.
 */

import path from 'path';
import pc from 'picocolors';
import { runAudit } from './index';
import { formatReport, formatReportJson } from './report';
import { AuditCliOptions } from './types';

/**
 * Parse argv for the audit subcommand.
 */
function parseAuditArgs(argv: string[]): AuditCliOptions {
  let dir = '.';
  let json = false;
  let verbose = false;

  // Skip first 3 args: node, script, 'audit'
  const args = argv.slice(3);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--dir' || arg === '-d') {
      dir = args[++i] ?? '.';
    } else if (!arg!.startsWith('-')) {
      dir = arg!;
    }
  }

  return { dir, json, verbose };
}

/**
 * Run the audit CLI subcommand.
 */
export async function runAuditCli(argv: string[]): Promise<void> {
  const opts = parseAuditArgs(argv);
  const projectDir = path.resolve(opts.dir);

  if (!opts.json) {
    console.log(pc.bold('\n🔍 Running project audit...\n'));
  }

  const report = await runAudit(projectDir);

  if (opts.json) {
    console.log(formatReportJson(report));
  } else {
    console.log(formatReport(report, opts.verbose));
  }

  // Exit with non-zero if any error-severity checks failed
  const hasErrors = report.results.some((r) => r.status === 'fail' && r.severity === 'error');
  if (hasErrors) {
    process.exitCode = 1;
  }
}

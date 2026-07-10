#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';
import {
  CLI_DESCRIPTION,
  CLI_NAME,
  CLI_VERSION,
} from './constants';
import { Core2CodeError, ExitCode } from './errors';
import { scaffoldProject } from './generator';
import { ConsoleLogger } from './logger';
import type { Logger, ScaffoldResult } from './types';

interface CliOptions {
  readonly git: boolean;
  readonly force: boolean;
}

export function buildProgram(): Command {
  const program = new Command();

  program
    .exitOverride()
    .name(CLI_NAME)
    .description(CLI_DESCRIPTION)
    .version(CLI_VERSION, '-v, --version', 'output the version number')
    .argument('<project-name>', 'name of the project to create')
    .option('--no-git', 'skip git repository initialization')
    .option('-f, --force', 'overwrite the target directory if it already exists', false)
    .showHelpAfterError('(add --help for usage)')
    .action(async (projectName: string, options: CliOptions) => {
      const logger = new ConsoleLogger();
      const result = await scaffoldProject({
        projectName,
        cwd: process.cwd(),
        overwrite: options.force,
        initGit: options.git,
        logger,
      });
      printNextSteps(result, logger);
    });

  return program;
}

function printNextSteps(result: ScaffoldResult, logger: Logger): void {
  logger.plain('');
  logger.success(`Created ${pc.bold(result.projectName)} at ${result.projectPath}`);
  logger.plain('');
  logger.plain(pc.bold('Next steps:'));
  logger.plain(`  ${pc.cyan(`cd ${result.projectName}`)}`);
  logger.plain(`  Open ${pc.cyan('PROJECT_BOOTSTRAP.md')} and work top to bottom.`);
  logger.plain(`  Point your AI assistant at ${pc.cyan('CLAUDE.md')} / ${pc.cyan('AGENTS.md')}.`);
  logger.plain(
    `  Before shipping, run ${pc.cyan('09-checklists/production-hardening.md')}.`,
  );
  if (!result.gitInitialized) {
    logger.plain(`  Initialize version control when ready: ${pc.cyan('git init')}`);
  }
  logger.plain('');
}

function reportError(error: unknown, logger: Logger): ExitCode {
  if (error instanceof Core2CodeError) {
    logger.error(error.message);
    return error.exitCode;
  }
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Unexpected error: ${message}`);
  if (process.env.CORE2CODE_DEBUG === '1' && error instanceof Error && error.stack) {
    logger.plain(error.stack);
  }
  return ExitCode.GenericError;
}

export async function run(argv: readonly string[] = process.argv): Promise<void> {
  const program = buildProgram();
  try {
    await program.parseAsync([...argv]);
  } catch (error) {
    if (isCommanderExit(error)) {
      const code = (error as { exitCode?: number }).exitCode;
      if (typeof code === 'number' && code !== 0) {
        process.exitCode = code;
      }
      return;
    }
    process.exitCode = reportError(error, new ConsoleLogger());
  }
}

function isCommanderExit(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    (error as { code: string }).code.startsWith('commander.')
  );
}

if (require.main === module) {
  void run();
}

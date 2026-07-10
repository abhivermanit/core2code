#!/usr/bin/env node

import { Command } from 'commander';
import { CliOptions, ExitCode } from './types';
import { buildProjectConfig } from './config';
import { generateProject } from './generator';
import { runPrompts } from './prompts';
import { ConsoleLogger } from './logger';
import { CliError } from './errors';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

/**
 * Collect stack keys from CLI flags.
 */
function collectStacks(opts: CliOptions): string[] {
  const stacks: string[] = [];
  if (opts.react) stacks.push('react');
  if (opts.nextjs) stacks.push('nextjs');
  if (opts.express) stacks.push('express');
  if (opts.fastify) stacks.push('fastify');
  if (opts.postgres) stacks.push('postgres');
  if (opts.mongodb) stacks.push('mongodb');
  if (opts.docker) stacks.push('docker');
  if (opts.githubActions) stacks.push('github-actions');
  return stacks;
}

/**
 * Main entry point for the CLI.
 */
export async function main(argv?: string[]): Promise<void> {
  const logger = new ConsoleLogger();

  const program = new Command()
    .name('create-core2code')
    .description('Scaffold a new project using the Core2Code engineering framework.')
    .version(pkg.version, '-v, --version')
    .argument('[project-name]', 'name of the project to create')
    .option('--no-git', 'skip git repository initialization')
    .option('-f, --force', 'overwrite the target directory if it already exists', false)
    .option('-y, --yes', 'skip interactive prompts and use defaults', false)
    .option('--react', 'include React frontend stack', false)
    .option('--nextjs', 'include Next.js full-stack', false)
    .option('--express', 'include Express backend stack', false)
    .option('--fastify', 'include Fastify backend stack', false)
    .option('--postgres', 'include PostgreSQL database stack', false)
    .option('--mongodb', 'include MongoDB database stack', false)
    .option('--docker', 'include Docker infrastructure stack', false)
    .option('--github-actions', 'include GitHub Actions CI/CD stack', false);

  program.parse(argv || process.argv);

  const opts = program.opts<CliOptions>();
  const args = program.args;
  const projectNameArg = args[0];

  try {
    let projectName: string;
    let stacks: string[];

    if (opts.yes) {
      // Non-interactive mode
      projectName = projectNameArg || 'my-project';
      stacks = collectStacks(opts);
    } else if (projectNameArg && collectStacks(opts).length > 0) {
      // Name + stacks provided via CLI args, skip prompts
      projectName = projectNameArg;
      stacks = collectStacks(opts);
    } else {
      // Interactive mode
      const answers = await runPrompts(projectNameArg);
      projectName = answers.projectName;
      stacks = answers.stacks;
    }

    const config = buildProjectConfig({
      projectName,
      stacks,
      initGit: opts.git !== false,
      force: opts.force,
    });

    await generateProject({ config, logger });
  } catch (err) {
    if (err instanceof CliError) {
      logger.error(err.message);
      process.exitCode = err.exitCode;
    } else if (err instanceof Error) {
      logger.error(err.message);
      process.exitCode = ExitCode.Unknown;
    } else {
      logger.error('An unknown error occurred.');
      process.exitCode = ExitCode.Unknown;
    }
  }
}

// Run when invoked directly
if (require.main === module) {
  main();
}

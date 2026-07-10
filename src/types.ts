/**
 * Exit codes used by the CLI.
 */
export enum ExitCode {
  Success = 0,
  InvalidInput = 1,
  FileSystemError = 2,
  GitError = 3,
  Aborted = 4,
  Unknown = 99,
}

/**
 * Technology stack category.
 */
export type StackCategory = 'frontend' | 'backend' | 'database' | 'infra';

/**
 * Definition of a single technology stack.
 */
export interface StackDefinition {
  key: string;
  category: StackCategory;
  label: string;
  description: string;
  templateDir: string;
}

/**
 * User responses from the interactive prompts.
 */
export interface PromptAnswers {
  projectName: string;
  stacks: string[];
}

/**
 * Options passed to the project generator.
 */
export interface GeneratorOptions {
  config: ProjectConfig;
  logger: Logger;
}

/**
 * Result returned by the generator.
 */
export interface GeneratorResult {
  projectPath: string;
  stacks: string[];
}

/**
 * Full configuration for a project to be generated.
 */
export interface ProjectConfig {
  projectName: string;
  stacks: string[];
  outputDir: string;
  initGit: boolean;
  force: boolean;
}

/**
 * Logger interface used throughout the CLI.
 */
export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  plain(message: string): void;
  startSpinner(message: string): void;
  stopSpinner(success?: boolean, message?: string): void;
}

/**
 * CLI options parsed from command-line arguments.
 */
export interface CliOptions {
  yes: boolean;
  force: boolean;
  git: boolean;
  react: boolean;
  nextjs: boolean;
  express: boolean;
  fastify: boolean;
  postgres: boolean;
  mongodb: boolean;
  docker: boolean;
  githubActions: boolean;
}

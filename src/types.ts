/**
 * Shared type contracts for the Core2Code CLI.
 */

export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  plain(message: string): void;
  step<T>(label: string, task: () => Promise<T>): Promise<T>;
}

export interface TemplateContext {
  readonly PROJECT_NAME: string;
  readonly CURRENT_YEAR: string;
  readonly CURRENT_DATE: string;
}

export interface ScaffoldOptions {
  readonly projectName: string;
  readonly cwd: string;
  readonly overwrite: boolean;
  readonly initGit: boolean;
  readonly logger: Logger;
}

export interface ScaffoldResult {
  readonly projectName: string;
  readonly projectPath: string;
  readonly filesProcessed: number;
  readonly gitInitialized: boolean;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

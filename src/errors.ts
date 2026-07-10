import { ExitCode } from './types';

/**
 * Base error class for the CLI with an associated exit code.
 */
export class CliError extends Error {
  public readonly exitCode: ExitCode;

  constructor(message: string, exitCode: ExitCode = ExitCode.Unknown) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
  }
}

/**
 * Thrown when the user provides an invalid project name.
 */
export class InvalidProjectNameError extends CliError {
  constructor(projectName: string, detail: string) {
    super(
      `Invalid project name "${projectName}":\n${detail}`,
      ExitCode.InvalidInput,
    );
    this.name = 'InvalidProjectNameError';
  }
}

/**
 * Thrown when a filesystem operation fails.
 */
export class FileSystemError extends CliError {
  constructor(message: string) {
    super(message, ExitCode.FileSystemError);
    this.name = 'FileSystemError';
  }
}

/**
 * Thrown when a git operation fails.
 */
export class GitError extends CliError {
  constructor(message: string) {
    super(message, ExitCode.GitError);
    this.name = 'GitError';
  }
}

/**
 * Thrown when the user aborts the operation.
 */
export class AbortedError extends CliError {
  constructor(message = 'Operation aborted by user.') {
    super(message, ExitCode.Aborted);
    this.name = 'AbortedError';
  }
}

/**
 * Thrown when one or more requested stacks are invalid.
 */
export class InvalidStackError extends CliError {
  constructor(invalidStacks: string[]) {
    super(
      `Unknown stack(s): ${invalidStacks.join(', ')}`,
      ExitCode.InvalidInput,
    );
    this.name = 'InvalidStackError';
  }
}

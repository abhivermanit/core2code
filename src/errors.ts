export enum ExitCode {
  Success = 0,
  GenericError = 1,
  InvalidInput = 2,
  TargetExists = 3,
  TemplateMissing = 4,
  FileSystemError = 5,
}

export class Core2CodeError extends Error {
  public readonly exitCode: ExitCode;

  constructor(message: string, exitCode: ExitCode = ExitCode.GenericError) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
    this.exitCode = exitCode;
  }
}

export class InvalidProjectNameError extends Core2CodeError {
  constructor(projectName: string, reasons: readonly string[]) {
    const detail = reasons.map((r) => `  - ${r}`).join('\n');
    super(`Invalid project name "${projectName}":\n${detail}`, ExitCode.InvalidInput);
  }
}

export class DirectoryExistsError extends Core2CodeError {
  constructor(projectPath: string) {
    super(
      `Target directory already exists and is not empty:\n  ${projectPath}\n` +
        `Choose a different name or re-run with --force to overwrite.`,
      ExitCode.TargetExists,
    );
  }
}

export class TemplateNotFoundError extends Core2CodeError {
  constructor(searchedPaths: readonly string[]) {
    const detail = searchedPaths.map((p) => `  - ${p}`).join('\n');
    super(
      `Could not locate the bundled Core2Code template. Searched:\n${detail}\n` +
        `This usually means the package was installed incompletely.`,
      ExitCode.TemplateMissing,
    );
  }
}

export class FileSystemError extends Core2CodeError {
  constructor(message: string, cause?: unknown) {
    super(message, ExitCode.FileSystemError);
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

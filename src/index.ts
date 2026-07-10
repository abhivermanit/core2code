/**
 * Public programmatic API.
 */
export { scaffoldProject } from './generator';
export { buildProgram, run } from './cli';
export {
  createTemplateContext,
  renderString,
  renderProjectReadme,
  applyContextToTree,
  buildReplacements,
} from './template';
export { validateProjectName, assertValidProjectName } from './validation';
export { isGitAvailable, initRepository } from './git';
export { ConsoleLogger, SilentLogger, createSilentLogger } from './logger';
export {
  Core2CodeError,
  InvalidProjectNameError,
  DirectoryExistsError,
  TemplateNotFoundError,
  FileSystemError,
  ExitCode,
} from './errors';
export {
  CLI_NAME,
  CLI_VERSION,
  CLI_DESCRIPTION,
  PLACEHOLDERS,
  resolveTemplateRoot,
} from './constants';
export type {
  Logger,
  TemplateContext,
  ScaffoldOptions,
  ScaffoldResult,
  ValidationResult,
} from './types';

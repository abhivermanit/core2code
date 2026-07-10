// Public API
export { generateProject } from './generator';
export { buildProjectConfig } from './config';
export { createSilentLogger, ConsoleLogger, SilentLogger } from './logger';
export { validateProjectName, assertValidProjectName } from './validation';
export { isGitAvailable, initRepository } from './git';
export { getAllStacks, getStacksByCategory, isValidStack, resolveStacks, findInvalidStacks, getCategories } from './registry';
export { resolveTemplatePath, resolveCommonTemplatePath, resolveAllTemplatePaths } from './templateResolver';
export { runPrompts } from './prompts';

// Types
export type {
  ExitCode,
  StackCategory,
  StackDefinition,
  PromptAnswers,
  GeneratorOptions,
  GeneratorResult,
  ProjectConfig,
  Logger,
  CliOptions,
} from './types';

// Errors
export { CliError, InvalidProjectNameError, FileSystemError, GitError, AbortedError, InvalidStackError } from './errors';

// Constants
export { STACKS, STACK_MAP, VALID_STACK_KEYS, TEMPLATE_DIR, PACKAGE_ROOT, NAME_PATTERN, MAX_NAME_LENGTH } from './constants';

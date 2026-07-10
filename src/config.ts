import path from 'path';
import { ProjectConfig } from './types';
import { findInvalidStacks } from './registry';
import { InvalidProjectNameError, InvalidStackError } from './errors';
import { validateProjectName } from './validation';

/**
 * Options for building a project config.
 */
export interface BuildConfigOptions {
  projectName: string;
  stacks?: string[];
  outputDir?: string;
  initGit?: boolean;
  force?: boolean;
}

/**
 * Build a fully resolved ProjectConfig, validating inputs.
 */
export function buildProjectConfig(options: BuildConfigOptions): ProjectConfig {
  const { projectName, stacks = [], outputDir, initGit = true, force = false } = options;

  // Validate project name
  const nameResult = validateProjectName(projectName);
  if (!nameResult.valid) {
    throw new InvalidProjectNameError(projectName, nameResult.errors.join('; '));
  }

  // Validate stacks
  const invalid = findInvalidStacks(stacks);
  if (invalid.length > 0) {
    throw new InvalidStackError(invalid);
  }

  // Resolve output directory
  const resolvedOutputDir = outputDir
    ? path.resolve(outputDir, projectName)
    : path.resolve(process.cwd(), projectName);

  return {
    projectName,
    stacks,
    outputDir: resolvedOutputDir,
    initGit,
    force,
  };
}

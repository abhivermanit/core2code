import path from 'path';
import { TEMPLATE_DIR } from './constants';
import { StackDefinition } from './types';

/**
 * Resolves the filesystem path for a given stack's template directory.
 */
export function resolveTemplatePath(stack: StackDefinition): string {
  return path.join(TEMPLATE_DIR, stack.templateDir);
}

/**
 * Resolves the common template path (shared across all projects).
 */
export function resolveCommonTemplatePath(): string {
  return path.join(TEMPLATE_DIR, 'common');
}

/**
 * Given a list of stack definitions, returns unique template directories to copy.
 * Always includes the common directory first.
 */
export function resolveAllTemplatePaths(stacks: StackDefinition[]): string[] {
  const paths = new Set<string>();

  // Always include common template
  paths.add(resolveCommonTemplatePath());

  // Add stack-specific templates
  for (const stack of stacks) {
    paths.add(resolveTemplatePath(stack));
  }

  return [...paths];
}

/**
 * Returns the auth template path for authentication-related scaffolding.
 */
export function resolveAuthTemplatePath(): string {
  return path.join(TEMPLATE_DIR, 'auth');
}

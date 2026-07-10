import { NAME_PATTERN, MAX_NAME_LENGTH } from './constants';
import { InvalidProjectNameError } from './errors';

/**
 * Result of validating a project name.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a project name against naming rules.
 * Returns a result object with validity and any error messages.
 */
export function validateProjectName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Project name cannot be empty');
  } else {
    if (name.length > MAX_NAME_LENGTH) {
      errors.push(`Project name must be ${MAX_NAME_LENGTH} characters or fewer`);
    }
    if (!NAME_PATTERN.test(name)) {
      errors.push(
        'Project name must start with a lowercase letter, and contain only lowercase letters, numbers, hyphens, or underscores',
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Assert that a project name is valid, throwing if not.
 */
export function assertValidProjectName(name: string): void {
  const result = validateProjectName(name);
  if (!result.valid) {
    throw new InvalidProjectNameError(name, result.errors.join('; '));
  }
}

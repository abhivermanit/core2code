import { MAX_PROJECT_NAME_LENGTH, RESERVED_NAMES } from './constants';
import { InvalidProjectNameError } from './errors';
import type { ValidationResult } from './types';

const NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export function validateProjectName(projectName: string): ValidationResult {
  const errors: string[] = [];
  const name = projectName?.trim() ?? '';

  if (name.length === 0) {
    errors.push('name must not be empty');
    return { valid: false, errors };
  }

  if (name.length > MAX_PROJECT_NAME_LENGTH) {
    errors.push(`name must be ${MAX_PROJECT_NAME_LENGTH} characters or fewer`);
  }

  if (!NAME_PATTERN.test(name)) {
    errors.push(
      'name may contain only letters, digits, ".", "-" and "_", and must start with a letter or digit',
    );
  }

  if (name.endsWith('.')) {
    errors.push('name must not end with a dot');
  }

  if (RESERVED_NAMES.has(name.toLowerCase())) {
    errors.push(`"${name}" is a reserved name`);
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidProjectName(projectName: string): void {
  const result = validateProjectName(projectName);
  if (!result.valid) {
    throw new InvalidProjectNameError(projectName, result.errors);
  }
}

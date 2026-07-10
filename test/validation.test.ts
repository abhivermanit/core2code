import { describe, expect, it } from 'vitest';
import { assertValidProjectName, validateProjectName } from '../src/validation';
import { InvalidProjectNameError } from '../src/errors';

describe('validateProjectName', () => {
  it.each([
    'nutrition-app',
    'my_app',
    'app123',
    'a',
    'Project.Name',
    'x'.repeat(214),
  ])('accepts a valid name: %s', (name) => {
    expect(validateProjectName(name).valid).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = validateProjectName('   ');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('name must not be empty');
  });

  it('rejects names with spaces or illegal characters', () => {
    expect(validateProjectName('my app').valid).toBe(false);
    expect(validateProjectName('app!').valid).toBe(false);
    expect(validateProjectName('a/b').valid).toBe(false);
  });

  it('rejects names not starting with a letter or digit', () => {
    expect(validateProjectName('-app').valid).toBe(false);
    expect(validateProjectName('.app').valid).toBe(false);
    expect(validateProjectName('_app').valid).toBe(false);
  });

  it('rejects names ending with a dot', () => {
    expect(validateProjectName('app.').valid).toBe(false);
  });

  it('rejects names over the length limit', () => {
    expect(validateProjectName('x'.repeat(215)).valid).toBe(false);
  });

  it('rejects reserved names case-insensitively', () => {
    expect(validateProjectName('node_modules').valid).toBe(false);
    expect(validateProjectName('CON').valid).toBe(false);
  });

  it('reports multiple problems at once', () => {
    const result = validateProjectName('_bad name.');
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('assertValidProjectName', () => {
  it('does not throw for a valid name', () => {
    expect(() => assertValidProjectName('good-name')).not.toThrow();
  });

  it('throws InvalidProjectNameError for a bad name', () => {
    expect(() => assertValidProjectName('bad name')).toThrow(InvalidProjectNameError);
  });
});

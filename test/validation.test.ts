import { describe, it, expect } from 'vitest';
import { validateProjectName, assertValidProjectName } from '../src/validation';
import { InvalidProjectNameError } from '../src/errors';

describe('validation', () => {
  describe('validateProjectName', () => {
    it('accepts valid lowercase names', () => {
      expect(validateProjectName('my-app').valid).toBe(true);
      expect(validateProjectName('app').valid).toBe(true);
      expect(validateProjectName('my-cool-app').valid).toBe(true);
      expect(validateProjectName('app123').valid).toBe(true);
    });

    it('accepts names with underscores', () => {
      expect(validateProjectName('my_app').valid).toBe(true);
      expect(validateProjectName('my_cool_app').valid).toBe(true);
    });

    it('accepts names with hyphens and numbers', () => {
      expect(validateProjectName('app-v2').valid).toBe(true);
      expect(validateProjectName('my-app-2024').valid).toBe(true);
    });

    it('rejects empty names', () => {
      const result = validateProjectName('');
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('rejects whitespace-only names', () => {
      const result = validateProjectName('   ');
      expect(result.valid).toBe(false);
    });

    it('rejects names starting with a number', () => {
      const result = validateProjectName('123app');
      expect(result.valid).toBe(false);
    });

    it('rejects names with uppercase letters', () => {
      const result = validateProjectName('MyApp');
      expect(result.valid).toBe(false);
    });

    it('rejects names with special characters', () => {
      expect(validateProjectName('my@app').valid).toBe(false);
      expect(validateProjectName('my app').valid).toBe(false);
      expect(validateProjectName('my.app').valid).toBe(false);
    });

    it('rejects names starting with a hyphen', () => {
      expect(validateProjectName('-my-app').valid).toBe(false);
    });

    it('rejects names starting with an underscore', () => {
      expect(validateProjectName('_my-app').valid).toBe(false);
    });

    it('rejects names exceeding max length', () => {
      const longName = 'a' + 'b'.repeat(214);
      const result = validateProjectName(longName);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('214');
    });
  });

  describe('assertValidProjectName', () => {
    it('does not throw for valid names', () => {
      expect(() => assertValidProjectName('my-app')).not.toThrow();
      expect(() => assertValidProjectName('cool-project')).not.toThrow();
    });

    it('throws InvalidProjectNameError for invalid names', () => {
      expect(() => assertValidProjectName('')).toThrow(InvalidProjectNameError);
      expect(() => assertValidProjectName('INVALID')).toThrow(InvalidProjectNameError);
      expect(() => assertValidProjectName('123')).toThrow(InvalidProjectNameError);
    });
  });
});

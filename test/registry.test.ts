import { describe, it, expect } from 'vitest';
import {
  getAllStacks,
  getStacksByCategory,
  isValidStack,
  findInvalidStacks,
  resolveStacks,
  getCategories,
} from '../src/registry';

describe('registry', () => {
  describe('getAllStacks', () => {
    it('returns all registered stacks', () => {
      const stacks = getAllStacks();
      expect(stacks.length).toBeGreaterThan(0);
      expect(stacks.length).toBe(8);
    });

    it('returns a new array each time', () => {
      const a = getAllStacks();
      const b = getAllStacks();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('getStacksByCategory', () => {
    it('returns frontend stacks', () => {
      const stacks = getStacksByCategory('frontend');
      expect(stacks.length).toBe(2);
      expect(stacks.every((s) => s.category === 'frontend')).toBe(true);
    });

    it('returns backend stacks', () => {
      const stacks = getStacksByCategory('backend');
      expect(stacks.length).toBe(2);
      expect(stacks.every((s) => s.category === 'backend')).toBe(true);
    });

    it('returns database stacks', () => {
      const stacks = getStacksByCategory('database');
      expect(stacks.length).toBe(2);
      expect(stacks.every((s) => s.category === 'database')).toBe(true);
    });

    it('returns infra stacks', () => {
      const stacks = getStacksByCategory('infra');
      expect(stacks.length).toBe(2);
      expect(stacks.every((s) => s.category === 'infra')).toBe(true);
    });
  });

  describe('isValidStack', () => {
    it('returns true for valid stack keys', () => {
      expect(isValidStack('react')).toBe(true);
      expect(isValidStack('express')).toBe(true);
      expect(isValidStack('postgres')).toBe(true);
      expect(isValidStack('docker')).toBe(true);
      expect(isValidStack('github-actions')).toBe(true);
    });

    it('returns false for invalid stack keys', () => {
      expect(isValidStack('angular')).toBe(false);
      expect(isValidStack('')).toBe(false);
      expect(isValidStack('REACT')).toBe(false);
    });
  });

  describe('findInvalidStacks', () => {
    it('returns empty array for all valid keys', () => {
      expect(findInvalidStacks(['react', 'express'])).toEqual([]);
    });

    it('returns invalid keys', () => {
      expect(findInvalidStacks(['react', 'angular', 'vue'])).toEqual(['angular', 'vue']);
    });

    it('handles empty input', () => {
      expect(findInvalidStacks([])).toEqual([]);
    });
  });

  describe('resolveStacks', () => {
    it('resolves valid stack keys to definitions', () => {
      const result = resolveStacks(['react', 'express']);
      expect(result).toHaveLength(2);
      expect(result[0]!.key).toBe('react');
      expect(result[1]!.key).toBe('express');
    });

    it('throws for invalid stack keys', () => {
      expect(() => resolveStacks(['react', 'invalid'])).toThrow('Unknown stack(s): invalid');
    });
  });

  describe('getCategories', () => {
    it('returns ordered categories', () => {
      const categories = getCategories();
      expect(categories).toEqual(['frontend', 'backend', 'database', 'infra']);
    });

    it('returns a new array each time', () => {
      const a = getCategories();
      const b = getCategories();
      expect(a).not.toBe(b);
    });
  });
});

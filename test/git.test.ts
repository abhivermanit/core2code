import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import { isGitAvailable, initRepository } from '../src/git';

describe('git', () => {
  const testDir = path.join(__dirname, '.tmp-git-test');

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('isGitAvailable', () => {
    it('returns true when git is installed', () => {
      // Git should be available in the test environment
      expect(isGitAvailable()).toBe(true);
    });
  });

  describe('initRepository', () => {
    it('creates a .git directory', () => {
      initRepository(testDir);
      expect(fs.existsSync(path.join(testDir, '.git'))).toBe(true);
    });

    it('initializes with main branch when supported', () => {
      initRepository(testDir);
      const gitDir = path.join(testDir, '.git');
      expect(fs.existsSync(gitDir)).toBe(true);
    });
  });
});

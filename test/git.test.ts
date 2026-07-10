import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initRepository, isGitAvailable } from '../src/git';
import { removeDirectorySafe } from '../src/filesystem';

let workdir: string;

beforeEach(async () => {
  workdir = await fs.mkdtemp(path.join(os.tmpdir(), 'c2c-git-'));
});

afterEach(async () => {
  await removeDirectorySafe(workdir);
});

describe('isGitAvailable', () => {
  it('returns a boolean', () => {
    expect(typeof isGitAvailable()).toBe('boolean');
  });
});

describe('initRepository', () => {
  it('creates a .git directory when git is available', () => {
    if (!isGitAvailable()) {
      expect(initRepository(workdir)).toBe(false);
      return;
    }
    const ok = initRepository(workdir);
    expect(ok).toBe(true);
    expect(fs.pathExistsSync(path.join(workdir, '.git'))).toBe(true);
  });
});

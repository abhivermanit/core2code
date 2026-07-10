import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scaffoldProject } from '../src/generator';
import { createSilentLogger } from '../src/logger';
import { removeDirectorySafe } from '../src/filesystem';
import { DirectoryExistsError, InvalidProjectNameError } from '../src/errors';
import { isGitAvailable } from '../src/git';

let cwd: string;
const logger = createSilentLogger();

beforeEach(async () => {
  cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'c2c-e2e-'));
});

afterEach(async () => {
  await removeDirectorySafe(cwd);
});

describe('scaffoldProject (end-to-end)', () => {
  it('creates a fully populated project', async () => {
    const result = await scaffoldProject({
      projectName: 'nutrition-app',
      cwd,
      overwrite: false,
      initGit: true,
      logger,
    });

    const root = result.projectPath;
    expect(result.projectName).toBe('nutrition-app');
    expect(result.filesProcessed).toBeGreaterThanOrEqual(0);

    expect(await fs.pathExists(path.join(root, '00-foundation'))).toBe(true);
    expect(await fs.pathExists(path.join(root, '09-checklists', 'production-hardening.md'))).toBe(true);
    expect(await fs.pathExists(path.join(root, 'PROJECT_BOOTSTRAP.md'))).toBe(true);
    expect(await fs.pathExists(path.join(root, 'CLAUDE.md'))).toBe(true);

    expect(await fs.pathExists(path.join(root, 'CORE2CODE.md'))).toBe(true);
    const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8');
    expect(readme).toContain('# nutrition-app');
    expect(readme).not.toContain('{{PROJECT_NAME}}');

    expect(await fs.pathExists(path.join(root, '.gitignore'))).toBe(true);

    if (isGitAvailable()) {
      expect(result.gitInitialized).toBe(true);
      expect(await fs.pathExists(path.join(root, '.git'))).toBe(true);
    }
  });

  it('skips git when initGit is false', async () => {
    const result = await scaffoldProject({
      projectName: 'no-git-app',
      cwd,
      overwrite: false,
      initGit: false,
      logger,
    });
    expect(result.gitInitialized).toBe(false);
    expect(await fs.pathExists(path.join(result.projectPath, '.git'))).toBe(false);
  });

  it('rejects an invalid project name before touching disk', async () => {
    await expect(
      scaffoldProject({
        projectName: 'bad name',
        cwd,
        overwrite: false,
        initGit: false,
        logger,
      }),
    ).rejects.toBeInstanceOf(InvalidProjectNameError);
    expect(await fs.pathExists(path.join(cwd, 'bad name'))).toBe(false);
  });

  it('refuses to overwrite a non-empty directory without --force', async () => {
    const target = path.join(cwd, 'existing');
    await fs.ensureDir(target);
    await fs.writeFile(path.join(target, 'keep.txt'), 'do not delete');
    await expect(
      scaffoldProject({
        projectName: 'existing',
        cwd,
        overwrite: false,
        initGit: false,
        logger,
      }),
    ).rejects.toBeInstanceOf(DirectoryExistsError);
    expect(await fs.readFile(path.join(target, 'keep.txt'), 'utf8')).toBe('do not delete');
  });

  it('overwrites a non-empty directory when overwrite=true', async () => {
    const target = path.join(cwd, 'reused');
    await fs.ensureDir(target);
    await fs.writeFile(path.join(target, 'stale.txt'), 'old');
    const result = await scaffoldProject({
      projectName: 'reused',
      cwd,
      overwrite: true,
      initGit: false,
      logger,
    });
    expect(await fs.pathExists(path.join(result.projectPath, 'stale.txt'))).toBe(false);
    expect(await fs.pathExists(path.join(result.projectPath, 'PROJECT_BOOTSTRAP.md'))).toBe(true);
  });
});

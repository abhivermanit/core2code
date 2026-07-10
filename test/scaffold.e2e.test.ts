import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import { generateProject } from '../src/generator';
import { buildProjectConfig } from '../src/config';
import { createSilentLogger } from '../src/logger';

describe('scaffold e2e', () => {
  const testDir = path.join(__dirname, '.tmp-scaffold-test');
  const logger = createSilentLogger();

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('scaffolds a project with no stacks', async () => {
    const config = buildProjectConfig({
      projectName: 'test-project',
      stacks: [],
      outputDir: testDir,
      initGit: false,
    });

    const result = await generateProject({ config, logger });
    expect(result.projectPath).toBe(path.join(testDir, 'test-project'));
    expect(result.stacks).toEqual([]);
    expect(await fs.pathExists(result.projectPath)).toBe(true);
  });

  it('scaffolds a project with stacks', async () => {
    const config = buildProjectConfig({
      projectName: 'my-app',
      stacks: ['react', 'express'],
      outputDir: testDir,
      initGit: false,
    });

    const result = await generateProject({ config, logger });
    expect(result.stacks).toEqual(['react', 'express']);
    expect(await fs.pathExists(result.projectPath)).toBe(true);
  });

  it('initializes git repository when initGit is true', async () => {
    const config = buildProjectConfig({
      projectName: 'git-project',
      stacks: [],
      outputDir: testDir,
      initGit: true,
    });

    const result = await generateProject({ config, logger });
    expect(await fs.pathExists(path.join(result.projectPath, '.git'))).toBe(true);
  });

  it('does not create .git when initGit is false', async () => {
    const config = buildProjectConfig({
      projectName: 'no-git',
      stacks: [],
      outputDir: testDir,
      initGit: false,
    });

    const result = await generateProject({ config, logger });
    expect(await fs.pathExists(path.join(result.projectPath, '.git'))).toBe(false);
  });

  it('overwrites existing directory when force is true', async () => {
    const projectDir = path.join(testDir, 'force-project');
    await fs.ensureDir(projectDir);
    await fs.writeFile(path.join(projectDir, 'existing.txt'), 'old');

    const config = buildProjectConfig({
      projectName: 'force-project',
      stacks: [],
      outputDir: testDir,
      initGit: false,
      force: true,
    });

    const result = await generateProject({ config, logger });
    expect(await fs.pathExists(result.projectPath)).toBe(true);
    // Old file should be gone since directory was removed
    expect(await fs.pathExists(path.join(projectDir, 'existing.txt'))).toBe(false);
  });

  it('throws when directory exists and is not empty without force', async () => {
    const projectDir = path.join(testDir, 'exists-project');
    await fs.ensureDir(projectDir);
    await fs.writeFile(path.join(projectDir, 'existing.txt'), 'content');

    const config = buildProjectConfig({
      projectName: 'exists-project',
      stacks: [],
      outputDir: testDir,
      initGit: false,
      force: false,
    });

    await expect(generateProject({ config, logger })).rejects.toThrow(
      /already exists and is not empty/,
    );
  });
});

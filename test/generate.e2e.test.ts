import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import { generateProject } from '../src/generator';
import { buildProjectConfig } from '../src/config';
import { createSilentLogger } from '../src/logger';

describe('generate e2e', () => {
  const testDir = path.join(__dirname, '.tmp-generate-test');
  const logger = createSilentLogger();

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('generates a project with the correct name', async () => {
    const config = buildProjectConfig({
      projectName: 'gen-test',
      stacks: [],
      outputDir: testDir,
      initGit: false,
    });

    const result = await generateProject({ config, logger });
    expect(path.basename(result.projectPath)).toBe('gen-test');
  });

  it('returns the selected stacks in result', async () => {
    const config = buildProjectConfig({
      projectName: 'stack-test',
      stacks: ['react', 'postgres'],
      outputDir: testDir,
      initGit: false,
    });

    const result = await generateProject({ config, logger });
    expect(result.stacks).toEqual(['react', 'postgres']);
  });

  it('generates project in the specified output directory', async () => {
    const customDir = path.join(testDir, 'custom');
    await fs.ensureDir(customDir);

    const config = buildProjectConfig({
      projectName: 'output-test',
      stacks: [],
      outputDir: customDir,
      initGit: false,
    });

    const result = await generateProject({ config, logger });
    expect(result.projectPath).toBe(path.join(customDir, 'output-test'));
    expect(await fs.pathExists(result.projectPath)).toBe(true);
  });

  it('handles all stack combinations gracefully', async () => {
    const allStacks = ['react', 'express', 'postgres', 'docker'];

    const config = buildProjectConfig({
      projectName: 'all-stacks',
      stacks: allStacks,
      outputDir: testDir,
      initGit: false,
    });

    const result = await generateProject({ config, logger });
    expect(result.stacks).toEqual(allStacks);
    expect(await fs.pathExists(result.projectPath)).toBe(true);
  });

  it('creates project directory even when empty stacks', async () => {
    const config = buildProjectConfig({
      projectName: 'empty-stacks',
      stacks: [],
      outputDir: testDir,
      initGit: false,
    });

    const result = await generateProject({ config, logger });
    const exists = await fs.pathExists(result.projectPath);
    expect(exists).toBe(true);
  });

  it('can be called with programmatic API', async () => {
    const config = buildProjectConfig({
      projectName: 'programmatic',
      stacks: ['fastify', 'mongodb'],
      outputDir: testDir,
      initGit: false,
    });

    const result = await generateProject({
      config,
      logger: createSilentLogger(),
    });

    expect(result.projectPath).toContain('programmatic');
    expect(result.stacks).toContain('fastify');
    expect(result.stacks).toContain('mongodb');
  });
});

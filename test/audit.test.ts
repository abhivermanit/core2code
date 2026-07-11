import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { runAudit, computeScore, buildAuditContext, ALL_CHECKS } from '../src/audit';

describe('audit', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'core2code-audit-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  describe('buildAuditContext', () => {
    it('detects package.json and rootFiles', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'test-project' });
      await fs.ensureDir(path.join(tmpDir, 'src'));
      await fs.writeFile(path.join(tmpDir, 'README.md'), '# Test');

      const ctx = await buildAuditContext(tmpDir);
      expect(ctx.packageJson).toEqual({ name: 'test-project' });
      expect(ctx.rootFiles).toContain('package.json');
      expect(ctx.rootFiles).toContain('src');
      expect(ctx.rootFiles).toContain('README.md');
    });

    it('handles missing directory gracefully', async () => {
      const ctx = await buildAuditContext(path.join(tmpDir, 'nonexistent'));
      expect(ctx.packageJson).toBeNull();
      expect(ctx.rootFiles).toEqual([]);
      expect(ctx.hasGit).toBe(false);
    });

    it('detects .git and tsconfig.json', async () => {
      await fs.ensureDir(path.join(tmpDir, '.git'));
      await fs.writeJson(path.join(tmpDir, 'tsconfig.json'), { compilerOptions: {} });

      const ctx = await buildAuditContext(tmpDir);
      expect(ctx.hasGit).toBe(true);
      expect(ctx.hasTsConfig).toBe(true);
    });
  });

  describe('computeScore', () => {
    it('returns 100% for all passes', () => {
      const results = [
        { id: 'a', label: 'A', status: 'pass' as const, severity: 'error' as const, message: '' },
        { id: 'b', label: 'B', status: 'pass' as const, severity: 'warn' as const, message: '' },
      ];
      const score = computeScore(results);
      expect(score.percentage).toBe(100);
      expect(score.grade).toBe('A');
    });

    it('returns 0% for all failures', () => {
      const results = [
        { id: 'a', label: 'A', status: 'fail' as const, severity: 'error' as const, message: '' },
        { id: 'b', label: 'B', status: 'fail' as const, severity: 'warn' as const, message: '' },
      ];
      const score = computeScore(results);
      expect(score.percentage).toBe(0);
      expect(score.grade).toBe('F');
    });

    it('excludes skipped checks from total', () => {
      const results = [
        { id: 'a', label: 'A', status: 'pass' as const, severity: 'error' as const, message: '' },
        { id: 'b', label: 'B', status: 'skip' as const, severity: 'info' as const, message: '' },
      ];
      const score = computeScore(results);
      expect(score.percentage).toBe(100);
      expect(score.possible).toBe(10);
    });

    it('returns 100% when all checks are skipped', () => {
      const results = [
        { id: 'a', label: 'A', status: 'skip' as const, severity: 'info' as const, message: '' },
      ];
      const score = computeScore(results);
      expect(score.percentage).toBe(100);
    });
  });

  describe('ALL_CHECKS', () => {
    it('has unique IDs', () => {
      const ids = ALL_CHECKS.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('includes expected categories', () => {
      const categories = new Set(ALL_CHECKS.map((c) => c.category));
      expect(categories.has('structure')).toBe(true);
      expect(categories.has('config')).toBe(true);
      expect(categories.has('git')).toBe(true);
    });
  });

  describe('runAudit', () => {
    it('produces a passing report for a well-formed project', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        name: 'good-project',
        scripts: { test: 'vitest', build: 'tsc' },
        engines: { node: '>=18' },
      });
      await fs.ensureDir(path.join(tmpDir, 'src'));
      await fs.ensureDir(path.join(tmpDir, '.git'));
      await fs.writeFile(path.join(tmpDir, '.gitignore'), 'node_modules\n');
      await fs.writeFile(path.join(tmpDir, 'README.md'), '# Good Project\n');
      await fs.writeJson(path.join(tmpDir, 'tsconfig.json'), {
        compilerOptions: { strict: true },
      });
      await fs.writeFile(path.join(tmpDir, 'eslint.config.js'), 'module.exports = {};\n');
      await fs.writeFile(path.join(tmpDir, 'vitest.config.ts'), 'export default {};\n');

      const report = await runAudit(tmpDir);
      expect(report.score.percentage).toBe(100);
      expect(report.score.grade).toBe('A');
      expect(report.failed).toBe(0);
      expect(report.passed).toBeGreaterThan(0);
    });

    it('produces a failing report for an empty directory', async () => {
      const report = await runAudit(tmpDir);
      expect(report.score.percentage).toBeLessThan(100);
      expect(report.failed).toBeGreaterThan(0);
    });

    it('includes timestamp in ISO format', async () => {
      const report = await runAudit(tmpDir);
      expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import {
  runAudit,
  computeScore,
  computePhaseScores,
  computeOverallReadiness,
  buildAuditContext,
  ALL_CHECKS,
} from '../src/audit';

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
        { id: 'a', label: 'A', status: 'pass' as const, severity: 'error' as const, phase: 'engineering' as const, message: '' },
        { id: 'b', label: 'B', status: 'pass' as const, severity: 'warn' as const, phase: 'engineering' as const, message: '' },
      ];
      const score = computeScore(results);
      expect(score.percentage).toBe(100);
      expect(score.grade).toBe('A');
    });

    it('returns 0% for all failures', () => {
      const results = [
        { id: 'a', label: 'A', status: 'fail' as const, severity: 'error' as const, phase: 'engineering' as const, message: '' },
        { id: 'b', label: 'B', status: 'fail' as const, severity: 'warn' as const, phase: 'engineering' as const, message: '' },
      ];
      const score = computeScore(results);
      expect(score.percentage).toBe(0);
      expect(score.grade).toBe('F');
    });

    it('excludes skipped checks from total', () => {
      const results = [
        { id: 'a', label: 'A', status: 'pass' as const, severity: 'error' as const, phase: 'engineering' as const, message: '' },
        { id: 'b', label: 'B', status: 'skip' as const, severity: 'info' as const, phase: 'engineering' as const, message: '' },
      ];
      const score = computeScore(results);
      expect(score.percentage).toBe(100);
      expect(score.possible).toBe(10);
    });

    it('returns 100% when all checks are skipped', () => {
      const results = [
        { id: 'a', label: 'A', status: 'skip' as const, severity: 'info' as const, phase: 'engineering' as const, message: '' },
      ];
      const score = computeScore(results);
      expect(score.percentage).toBe(100);
    });
  });

  describe('computePhaseScores', () => {
    it('reports N/A for phases with no checks', () => {
      const results = [
        { id: 'a', label: 'A', status: 'pass' as const, severity: 'error' as const, phase: 'engineering' as const, message: '' },
      ];
      const phaseScores = computePhaseScores(results);
      const discovery = phaseScores.find((p) => p.phase === 'discovery')!;
      expect(discovery.checkCount).toBe(0);
      expect(discovery.percentage).toBeNull();
      expect(discovery.grade).toBeNull();
    });

    it('computes percentage for a phase with mixed pass/fail results', () => {
      const results = [
        { id: 'a', label: 'A', status: 'pass' as const, severity: 'error' as const, phase: 'security' as const, message: '' },
        { id: 'b', label: 'B', status: 'fail' as const, severity: 'error' as const, phase: 'security' as const, message: '' },
      ];
      const phaseScores = computePhaseScores(results);
      const security = phaseScores.find((p) => p.phase === 'security')!;
      expect(security.checkCount).toBe(2);
      expect(security.percentage).toBe(50);
    });

    it('covers every phase in PHASE_ORDER', () => {
      const phaseScores = computePhaseScores([]);
      expect(phaseScores).toHaveLength(7);
    });
  });

  describe('computeOverallReadiness', () => {
    it('averages only phases with checks, excluding N/A phases', () => {
      const results = [
        { id: 'a', label: 'A', status: 'pass' as const, severity: 'error' as const, phase: 'engineering' as const, message: '' },
        { id: 'b', label: 'B', status: 'fail' as const, severity: 'error' as const, phase: 'quality' as const, message: '' },
      ];
      const phaseScores = computePhaseScores(results);
      const overall = computeOverallReadiness(phaseScores);
      // engineering=100%, quality=0%, all other 5 phases N/A and excluded
      expect(overall.percentage).toBe(50);
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

    it('every check has a valid phase', () => {
      const validPhases = new Set([
        'discovery',
        'architecture',
        'engineering',
        'security',
        'quality',
        'delivery',
        'operations',
      ]);
      for (const check of ALL_CHECKS) {
        expect(validPhases.has(check.phase)).toBe(true);
      }
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
      expect(report.phaseScores).toHaveLength(7);
      expect(report.readyForProduction).toBe(true);
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

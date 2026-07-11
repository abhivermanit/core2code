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

    it('finds markdown docs at root and nested under docs/', async () => {
      await fs.writeFile(path.join(tmpDir, 'README.md'), '# Root doc\n');
      await fs.ensureDir(path.join(tmpDir, 'docs', 'nested'));
      await fs.writeFile(path.join(tmpDir, 'docs', 'PRD.md'), '# PRD\n');
      await fs.writeFile(path.join(tmpDir, 'docs', 'nested', 'risks.md'), '# Risks\n');
      await fs.ensureDir(path.join(tmpDir, 'docs', 'node_modules', 'somepkg'));
      await fs.writeFile(path.join(tmpDir, 'docs', 'node_modules', 'somepkg', 'README.md'), '# Ignore me\n');

      const ctx = await buildAuditContext(tmpDir);
      expect(ctx.docFiles).toContain('README.md');
      expect(ctx.docFiles).toContain('docs/PRD.md');
      expect(ctx.docFiles).toContain('docs/nested/risks.md');
      expect(ctx.docFiles.some((f) => f.includes('node_modules'))).toBe(false);
    });
  });

  describe('findEvidenceDoc path matching', () => {
    it('matches evidence via a directory name, not just the filename (e.g. docs/adr/0001-x.md)', async () => {
      await fs.ensureDir(path.join(tmpDir, 'docs', 'adr'));
      // Deliberately no "adr" in the filename itself — only the directory
      // carries it, so this only passes if matching uses the full path.
      await fs.writeFile(
        path.join(tmpDir, 'docs', 'adr', '0001-use-postgres.md'),
        '# 0001\n\nContext.\nDecision.\nAlternatives.\nConsequences.\nMore.\n',
      );
      const ctx = await buildAuditContext(tmpDir);
      const check = ALL_CHECKS.find((c) => c.id === 'ARCH-005')!;
      const result = await check.run(ctx);
      expect(result.status).toBe('pass');
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
      const architecture = phaseScores.find((p) => p.phase === 'architecture')!;
      expect(architecture.checkCount).toBe(0);
      expect(architecture.percentage).toBeNull();
      expect(architecture.grade).toBeNull();
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

    it('excludes manual_review from scoring, reporting N/A if that is all a phase has', () => {
      const results = [
        { id: 'a', label: 'A', status: 'manual_review' as const, severity: 'error' as const, phase: 'discovery' as const, message: '' },
      ];
      const phaseScores = computePhaseScores(results);
      const discovery = phaseScores.find((p) => p.phase === 'discovery')!;
      expect(discovery.checkCount).toBe(1);
      expect(discovery.percentage).toBeNull();
    });

    it('scores a phase from automatic checks only, ignoring manual_review results', () => {
      const results = [
        { id: 'a', label: 'A', status: 'pass' as const, severity: 'error' as const, phase: 'discovery' as const, message: '' },
        { id: 'b', label: 'B', status: 'manual_review' as const, severity: 'error' as const, phase: 'discovery' as const, message: '' },
      ];
      const phaseScores = computePhaseScores(results);
      const discovery = phaseScores.find((p) => p.phase === 'discovery')!;
      expect(discovery.checkCount).toBe(2);
      expect(discovery.percentage).toBe(100);
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
    async function writeWellFormedProject(dir: string): Promise<void> {
      await fs.writeJson(path.join(dir, 'package.json'), {
        name: 'good-project',
        scripts: { test: 'vitest', build: 'tsc' },
        engines: { node: '>=18' },
      });
      await fs.ensureDir(path.join(dir, 'src'));
      await fs.ensureDir(path.join(dir, '.git'));
      await fs.writeFile(path.join(dir, '.gitignore'), 'node_modules\n');
      await fs.writeFile(path.join(dir, 'README.md'), '# Good Project\n');
      await fs.writeJson(path.join(dir, 'tsconfig.json'), {
        compilerOptions: { strict: true },
      });
      await fs.writeFile(path.join(dir, 'eslint.config.js'), 'module.exports = {};\n');
      await fs.writeFile(path.join(dir, 'vitest.config.ts'), 'export default {};\n');

      const substantiveDoc = (title: string) =>
        `# ${title}\n\nLine one.\nLine two.\nLine three.\nLine four.\nLine five.\n`;
      await fs.ensureDir(path.join(dir, 'docs'));
      await fs.writeFile(path.join(dir, 'docs', 'PRD.md'), substantiveDoc('PRD'));
      await fs.writeFile(path.join(dir, 'docs', 'requirements.md'), substantiveDoc('Requirements'));
      await fs.writeFile(
        path.join(dir, 'docs', 'non-functional-requirements.md'),
        substantiveDoc('Non-Functional Requirements'),
      );
      await fs.writeFile(path.join(dir, 'docs', 'risks.md'), substantiveDoc('Risks'));
      await fs.writeFile(path.join(dir, 'docs', 'assumptions.md'), substantiveDoc('Assumptions'));

      await fs.writeFile(path.join(dir, 'docs', 'architecture.md'), substantiveDoc('Architecture'));
      await fs.writeFile(path.join(dir, 'docs', 'data-model.md'), substantiveDoc('Data Model'));
      await fs.writeFile(path.join(dir, 'docs', 'authentication.md'), substantiveDoc('Authentication'));
      await fs.writeFile(path.join(dir, 'docs', 'api-design.md'), substantiveDoc('API Design'));
      await fs.writeFile(path.join(dir, 'docs', 'threat-model.md'), substantiveDoc('Threat Model'));
      await fs.ensureDir(path.join(dir, 'docs', 'adr'));
      await fs.writeFile(path.join(dir, 'docs', 'adr', '0001-use-postgres.md'), substantiveDoc('0001'));
    }

    it('produces a passing report for a well-formed project', async () => {
      await writeWellFormedProject(tmpDir);

      const report = await runAudit(tmpDir);
      expect(report.score.percentage).toBe(100);
      expect(report.score.grade).toBe('A');
      expect(report.failed).toBe(0);
      expect(report.passed).toBeGreaterThan(0);
      expect(report.phaseScores).toHaveLength(7);
      expect(report.readyForProduction).toBe(true);
      // DISC-002/DISC-007 (Discovery) and ARCH-006/008/009 (Architecture)
      // are manual, so they never count as failures or move the score,
      // but should still surface as needing review.
      expect(report.needsReview).toBe(5);
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

  describe('Discovery checks', () => {
    function discoveryChecks() {
      return ALL_CHECKS.filter((c) => c.phase === 'discovery');
    }

    it('has 7 checks, ids DISC-001..007', () => {
      const ids = discoveryChecks()
        .map((c) => c.id)
        .sort();
      expect(ids).toEqual([
        'DISC-001',
        'DISC-002',
        'DISC-003',
        'DISC-004',
        'DISC-005',
        'DISC-006',
        'DISC-007',
      ]);
    });

    it('DISC-002 and DISC-007 always return manual_review, regardless of directory contents', async () => {
      const ctx = await buildAuditContext(tmpDir);
      const manualChecks = discoveryChecks().filter((c) => c.id === 'DISC-002' || c.id === 'DISC-007');
      for (const check of manualChecks) {
        const result = await check.run(ctx);
        expect(result.status).toBe('manual_review');
        expect(result.remediation).toBeTruthy();
      }
    });

    it('DISC-001 fails when no PRD/vision doc exists', async () => {
      const ctx = await buildAuditContext(tmpDir);
      const check = discoveryChecks().find((c) => c.id === 'DISC-001')!;
      const result = await check.run(ctx);
      expect(result.status).toBe('fail');
    });

    it('DISC-001 passes when a substantive PRD exists under docs/', async () => {
      await fs.ensureDir(path.join(tmpDir, 'docs'));
      await fs.writeFile(
        path.join(tmpDir, 'docs', 'PRD.md'),
        '# PRD\n\nLine one.\nLine two.\nLine three.\nLine four.\nLine five.\n',
      );
      const ctx = await buildAuditContext(tmpDir);
      const check = discoveryChecks().find((c) => c.id === 'DISC-001')!;
      const result = await check.run(ctx);
      expect(result.status).toBe('pass');
    });

    it('DISC-001 fails (not passes) when the PRD file exists but is near-empty', async () => {
      await fs.ensureDir(path.join(tmpDir, 'docs'));
      await fs.writeFile(path.join(tmpDir, 'docs', 'PRD.md'), '# PRD\n');
      const ctx = await buildAuditContext(tmpDir);
      const check = discoveryChecks().find((c) => c.id === 'DISC-001')!;
      const result = await check.run(ctx);
      expect(result.status).toBe('fail');
      expect(result.message).toMatch(/empty/);
    });

    it('DISC-003 does not match the non-functional-requirements doc', async () => {
      await fs.ensureDir(path.join(tmpDir, 'docs'));
      await fs.writeFile(
        path.join(tmpDir, 'docs', 'non-functional-requirements.md'),
        '# NFR\n\nLine one.\nLine two.\nLine three.\nLine four.\nLine five.\n',
      );
      const ctx = await buildAuditContext(tmpDir);
      const check = discoveryChecks().find((c) => c.id === 'DISC-003')!;
      const result = await check.run(ctx);
      expect(result.status).toBe('fail');
    });
  });

  describe('Architecture checks', () => {
    function architectureChecks() {
      return ALL_CHECKS.filter((c) => c.phase === 'architecture');
    }

    it('has 9 checks, ids ARCH-001..009', () => {
      const ids = architectureChecks()
        .map((c) => c.id)
        .sort();
      expect(ids).toEqual([
        'ARCH-001',
        'ARCH-002',
        'ARCH-003',
        'ARCH-004',
        'ARCH-005',
        'ARCH-006',
        'ARCH-007',
        'ARCH-008',
        'ARCH-009',
      ]);
    });

    it('ARCH-006, ARCH-008, and ARCH-009 always return manual_review, regardless of directory contents', async () => {
      const ctx = await buildAuditContext(tmpDir);
      const manualChecks = architectureChecks().filter((c) =>
        ['ARCH-006', 'ARCH-008', 'ARCH-009'].includes(c.id),
      );
      expect(manualChecks).toHaveLength(3);
      for (const check of manualChecks) {
        const result = await check.run(ctx);
        expect(result.status).toBe('manual_review');
        expect(result.remediation).toBeTruthy();
      }
    });

    it('ARCH-001 fails when no architecture description exists', async () => {
      const ctx = await buildAuditContext(tmpDir);
      const check = architectureChecks().find((c) => c.id === 'ARCH-001')!;
      const result = await check.run(ctx);
      expect(result.status).toBe('fail');
    });

    it('ARCH-001 passes when a substantive architecture doc exists under docs/', async () => {
      await fs.ensureDir(path.join(tmpDir, 'docs'));
      await fs.writeFile(
        path.join(tmpDir, 'docs', 'architecture.md'),
        '# Architecture\n\nLine one.\nLine two.\nLine three.\nLine four.\nLine five.\n',
      );
      const ctx = await buildAuditContext(tmpDir);
      const check = architectureChecks().find((c) => c.id === 'ARCH-001')!;
      const result = await check.run(ctx);
      expect(result.status).toBe('pass');
    });

    it('ARCH-005 passes when ADRs live in a docs/adr/ directory with non-"adr"-named files', async () => {
      await fs.ensureDir(path.join(tmpDir, 'docs', 'adr'));
      await fs.writeFile(
        path.join(tmpDir, 'docs', 'adr', '0001-use-postgres.md'),
        '# 0001\n\nContext.\nDecision.\nAlternatives.\nConsequences.\nMore.\n',
      );
      const ctx = await buildAuditContext(tmpDir);
      const check = architectureChecks().find((c) => c.id === 'ARCH-005')!;
      const result = await check.run(ctx);
      expect(result.status).toBe('pass');
    });

    it('ARCH-007 fails when no threat model exists', async () => {
      const ctx = await buildAuditContext(tmpDir);
      const check = architectureChecks().find((c) => c.id === 'ARCH-007')!;
      const result = await check.run(ctx);
      expect(result.status).toBe('fail');
    });
  });
});

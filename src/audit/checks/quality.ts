/**
 * Quality phase checks: test infrastructure.
 */

import { AuditCheck, AuditContext } from '../types';
import { pass, fail, skip } from './helpers';

const PHASE = 'quality';

const hasTestSetup: AuditCheck = {
  id: 'quality/test-setup',
  label: 'Test runner configured',
  category: 'quality',
  phase: PHASE,
  severity: 'info',
  run(ctx: AuditContext) {
    if (!ctx.packageJson) {
      return skip(this.id, this.label, this.phase, 'No package.json to check');
    }

    const scripts = ctx.packageJson['scripts'] as Record<string, string> | undefined;
    if (scripts && (scripts['test'] || scripts['test:unit'] || scripts['test:watch'])) {
      return pass(this.id, this.label, this.phase, 'Test script(s) found');
    }

    // Check for config files
    const testConfigs = ['vitest.config.ts', 'vitest.config.js', 'jest.config.ts', 'jest.config.js'];
    const hasTestConfig = ctx.rootFiles.some((f) => testConfigs.includes(f));
    if (hasTestConfig) {
      return pass(this.id, this.label, this.phase, 'Test config file found');
    }

    return fail(this.id, this.label, this.phase, 'info', 'No test runner configuration detected');
  },
};

/**
 * All Quality phase checks.
 */
export const QUALITY_CHECKS: AuditCheck[] = [hasTestSetup];

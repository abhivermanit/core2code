import { describe, it, expect } from 'vitest';
import { getTemplateVariables } from '../src/template';

describe('template', () => {
  describe('getTemplateVariables', () => {
    it('returns PROJECT_NAME variable', () => {
      const vars = getTemplateVariables('my-app', []);
      expect(vars.PROJECT_NAME).toBe('my-app');
    });

    it('returns CURRENT_YEAR variable', () => {
      const vars = getTemplateVariables('my-app', []);
      expect(vars.CURRENT_YEAR).toBe(String(new Date().getFullYear()));
    });

    it('returns CURRENT_DATE in ISO format', () => {
      const vars = getTemplateVariables('my-app', []);
      expect(vars.CURRENT_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns PACKAGE_MANAGER variable', () => {
      const vars = getTemplateVariables('my-app', ['react']);
      expect(vars.PACKAGE_MANAGER).toBe('pnpm');
    });
  });
});

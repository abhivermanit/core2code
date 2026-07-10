import { describe, it, expect } from 'vitest';
import path from 'path';
import { resolveTemplatePath, resolveCommonTemplatePath, resolveAllTemplatePaths, resolveAuthTemplatePath } from '../src/templateResolver';
import { TEMPLATE_DIR } from '../src/constants';
import { StackDefinition } from '../src/types';

describe('templateResolver', () => {
  const mockStack: StackDefinition = {
    key: 'react',
    category: 'frontend',
    label: 'React',
    description: 'React SPA with TypeScript and Vite',
    templateDir: 'frontend',
  };

  describe('resolveTemplatePath', () => {
    it('resolves the path for a stack', () => {
      const result = resolveTemplatePath(mockStack);
      expect(result).toBe(path.join(TEMPLATE_DIR, 'frontend'));
    });

    it('resolves different paths for different stacks', () => {
      const backendStack: StackDefinition = {
        key: 'express',
        category: 'backend',
        label: 'Express',
        description: 'Express.js REST API',
        templateDir: 'backend',
      };
      const result = resolveTemplatePath(backendStack);
      expect(result).toBe(path.join(TEMPLATE_DIR, 'backend'));
    });
  });

  describe('resolveCommonTemplatePath', () => {
    it('resolves to the common template directory', () => {
      const result = resolveCommonTemplatePath();
      expect(result).toBe(path.join(TEMPLATE_DIR, 'common'));
    });
  });

  describe('resolveAllTemplatePaths', () => {
    it('always includes common template path', () => {
      const result = resolveAllTemplatePaths([]);
      expect(result).toContain(path.join(TEMPLATE_DIR, 'common'));
    });

    it('includes stack-specific template paths', () => {
      const result = resolveAllTemplatePaths([mockStack]);
      expect(result).toContain(path.join(TEMPLATE_DIR, 'common'));
      expect(result).toContain(path.join(TEMPLATE_DIR, 'frontend'));
    });

    it('deduplicates template paths', () => {
      const anotherFrontendStack: StackDefinition = {
        key: 'nextjs',
        category: 'frontend',
        label: 'Next.js',
        description: 'Full-stack React with Next.js',
        templateDir: 'frontend',
      };
      const result = resolveAllTemplatePaths([mockStack, anotherFrontendStack]);
      const frontendPaths = result.filter((p) => p.endsWith('frontend'));
      expect(frontendPaths).toHaveLength(1);
    });

    it('includes multiple different template directories', () => {
      const backendStack: StackDefinition = {
        key: 'express',
        category: 'backend',
        label: 'Express',
        description: 'Express.js REST API',
        templateDir: 'backend',
      };
      const result = resolveAllTemplatePaths([mockStack, backendStack]);
      expect(result).toHaveLength(3); // common, frontend, backend
    });
  });

  describe('resolveAuthTemplatePath', () => {
    it('resolves to the auth template directory', () => {
      const result = resolveAuthTemplatePath();
      expect(result).toBe(path.join(TEMPLATE_DIR, 'auth'));
    });
  });
});

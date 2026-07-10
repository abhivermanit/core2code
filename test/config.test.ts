import { describe, it, expect } from 'vitest';
import path from 'path';
import { buildProjectConfig } from '../src/config';
import { InvalidProjectNameError, InvalidStackError } from '../src/errors';

describe('config', () => {
  describe('buildProjectConfig', () => {
    it('builds a valid config with minimal options', () => {
      const config = buildProjectConfig({ projectName: 'my-app' });
      expect(config.projectName).toBe('my-app');
      expect(config.stacks).toEqual([]);
      expect(config.initGit).toBe(true);
      expect(config.force).toBe(false);
      expect(config.outputDir).toBe(path.resolve(process.cwd(), 'my-app'));
    });

    it('builds a config with stacks', () => {
      const config = buildProjectConfig({
        projectName: 'my-app',
        stacks: ['react', 'express'],
      });
      expect(config.stacks).toEqual(['react', 'express']);
    });

    it('resolves custom outputDir', () => {
      const config = buildProjectConfig({
        projectName: 'my-app',
        outputDir: '/tmp/projects',
      });
      expect(config.outputDir).toBe(path.resolve('/tmp/projects', 'my-app'));
    });

    it('respects initGit: false', () => {
      const config = buildProjectConfig({
        projectName: 'my-app',
        initGit: false,
      });
      expect(config.initGit).toBe(false);
    });

    it('respects force: true', () => {
      const config = buildProjectConfig({
        projectName: 'my-app',
        force: true,
      });
      expect(config.force).toBe(true);
    });

    it('throws InvalidProjectNameError for invalid name', () => {
      expect(() => buildProjectConfig({ projectName: '' })).toThrow(InvalidProjectNameError);
      expect(() => buildProjectConfig({ projectName: 'INVALID' })).toThrow(InvalidProjectNameError);
      expect(() => buildProjectConfig({ projectName: '123abc' })).toThrow(InvalidProjectNameError);
    });

    it('throws InvalidStackError for unknown stacks', () => {
      expect(() =>
        buildProjectConfig({ projectName: 'my-app', stacks: ['angular'] }),
      ).toThrow(InvalidStackError);
    });

    it('throws InvalidStackError listing all unknown stacks', () => {
      try {
        buildProjectConfig({ projectName: 'my-app', stacks: ['angular', 'vue'] });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidStackError);
        expect((err as Error).message).toContain('angular');
        expect((err as Error).message).toContain('vue');
      }
    });
  });
});

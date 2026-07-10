import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock prompts module
vi.mock('prompts', () => {
  return {
    default: vi.fn(),
  };
});

import prompts from 'prompts';
import { runPrompts } from '../src/prompts';
import { AbortedError } from '../src/errors';

const mockPrompts = vi.mocked(prompts);

describe('prompts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runPrompts', () => {
    it('collects project name and stacks', async () => {
      // First call: project name
      mockPrompts.mockResolvedValueOnce({ projectName: 'my-app' });
      // Category prompts: frontend, backend, database, infra
      mockPrompts.mockResolvedValueOnce({ stack: 'react' });
      mockPrompts.mockResolvedValueOnce({ stack: 'express' });
      mockPrompts.mockResolvedValueOnce({ stack: '' });
      mockPrompts.mockResolvedValueOnce({ stack: 'docker' });

      const result = await runPrompts();
      expect(result.projectName).toBe('my-app');
      expect(result.stacks).toEqual(['react', 'express', 'docker']);
    });

    it('uses defaultName as initial value', async () => {
      mockPrompts.mockResolvedValueOnce({ projectName: 'preset-name' });
      mockPrompts.mockResolvedValueOnce({ stack: '' });
      mockPrompts.mockResolvedValueOnce({ stack: '' });
      mockPrompts.mockResolvedValueOnce({ stack: '' });
      mockPrompts.mockResolvedValueOnce({ stack: '' });

      const result = await runPrompts('preset-name');
      expect(result.projectName).toBe('preset-name');
      expect(result.stacks).toEqual([]);
    });

    it('throws AbortedError when projectName is empty', async () => {
      mockPrompts.mockResolvedValueOnce({ projectName: '' });

      await expect(runPrompts()).rejects.toThrow(AbortedError);
    });

    it('skips stacks with empty selection', async () => {
      mockPrompts.mockResolvedValueOnce({ projectName: 'test-project' });
      mockPrompts.mockResolvedValueOnce({ stack: '' });
      mockPrompts.mockResolvedValueOnce({ stack: '' });
      mockPrompts.mockResolvedValueOnce({ stack: '' });
      mockPrompts.mockResolvedValueOnce({ stack: '' });

      const result = await runPrompts();
      expect(result.stacks).toEqual([]);
    });
  });
});

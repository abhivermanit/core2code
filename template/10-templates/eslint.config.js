// ESLint Flat Config (ESLint 9+)
// Modern configuration with TypeScript support

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import security from 'eslint-plugin-security';

export default tseslint.config(
  // Base recommended rules
  eslint.configs.recommended,

  // Security rules (detect-eval, unsafe-regex, non-literal-fs-filename, etc.)
  security.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Disable formatting rules (handled by Prettier)
  prettier,

  // Global ignores
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '*.config.js'],
  },

  // Project-specific rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  // Test files (relaxed rules)
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  }
);

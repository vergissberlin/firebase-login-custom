import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js', '*.config.ts', '*.config.mjs'],
  },
];

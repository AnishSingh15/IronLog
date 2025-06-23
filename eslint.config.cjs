// eslint.config.cjs
const js = require('@eslint/js');
const nextPlugin = require('@next/eslint-plugin-next');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = [
  // 1. Base JS rules
  js.configs.recommended,

  // 2. All TypeScript / TSX files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: true,
        document: true,
        HTMLElement: true,
        HTMLButtonElement: true,
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // 3. Next.js + React (web app only)
  {
    files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'react/react-in-jsx-scope': 'off',
      '@next/next/no-duplicate-head': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
    settings: { react: { version: 'detect' } },
  },

  // 4. Node.js globals for server
  {
    files: ['apps/server/**/*.ts'],
    languageOptions: {
      globals: {
        process: true,
        console: true,
        Buffer: true,
        __dirname: true,
        __filename: true,
        global: true,
        module: true,
        require: true,
        exports: true,
      },
    },
  },

  // 5. Test environment globals
  {
    files: ['**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        test: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
        jest: true,
        vi: true, // Vitest
      },
    },
  },

  // 6. Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
    ],
  },
];

import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Basic Next.js rules only, avoiding TypeScript rules that cause crashes
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Disable all problematic rules completely
      'react-hooks/exhaustive-deps': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
      // Explicitly disable any TypeScript rules that might be loaded
      ...Object.fromEntries(
        [
          'no-unsafe-declaration-merging',
          'no-unsafe-assignment',
          'no-unsafe-member-access',
          'no-unsafe-call',
          'no-unsafe-return',
          'no-unsafe-argument',
          'no-var-requires',
          'no-explicit-any',
          'no-unused-vars',
          'prefer-nullish-coalescing',
          'prefer-optional-chain',
          'restrict-template-expressions',
        ].map(rule => [`@typescript-eslint/${rule}`, 'off'])
      ),
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'out/**',
      '*.config.*',
    ],
  },
];

export default eslintConfig;

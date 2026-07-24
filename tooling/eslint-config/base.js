import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.payload/**',
      '**/*.tsbuildinfo',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      // Keep module interfaces and data flow explicit; avoid broad style-only rules.
      'default-param-last': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-param-reassign': ['error', { props: true }],
      'no-promise-executor-return': 'error',
      'no-return-assign': ['error', 'always'],
      'no-unmodified-loop-condition': 'error',
      'no-useless-assignment': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.object.name='process'][object.property.name='env']",
          message:
            'Do not read process.env directly; import from your workspace src/env.ts (validated by @t3-oss/env-*).',
        },
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message:
            'Do not read process.env directly; import from your workspace src/env.ts (validated by @t3-oss/env-*).',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: [
      '**/src/env.ts',
      '**/env.ts',
      '**/*.config.{ts,js,mjs}',
      '**/eslint.config.{ts,js,mjs}',
    ],
    rules: {
      'no-param-reassign': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  prettier,
];

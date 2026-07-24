import config from '@mvp-realty/eslint-config/nextjs';

export default [
  ...config,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mvp-realty/backend', '@mvp-realty/backend/*', '**/backend/**'],
              message:
                'Web must not import backend app code. Move shared contracts into @mvp-realty/api-contracts.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];

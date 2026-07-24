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
              group: ['@mvp-realty/web', '@mvp-realty/web/*', '**/web/**'],
              message:
                'Backend must not import web app code. Move shared contracts into @mvp-realty/api-contracts.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      '.next/**',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'next-env.d.ts',
    ],
  },
];

import config from '@mvp-realty/eslint-config/react';

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
              group: [
                '@mvp-realty/web',
                '@mvp-realty/web/*',
                '@mvp-realty/backend',
                '@mvp-realty/backend/*',
                '**/apps/**',
                '**/web/**',
                '**/backend/**',
                'next',
                'next/*',
                'payload',
                'payload/*',
                '@payloadcms/*',
              ],
              message:
                'UI package must stay app-agnostic. Keep app, Next, and Payload code in the apps.',
            },
          ],
        },
      ],
    },
  },
];

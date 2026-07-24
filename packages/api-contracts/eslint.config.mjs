import config from '@mvp-realty/eslint-config/base';

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
                '@mvp-realty/ui',
                '@mvp-realty/ui/*',
                '**/apps/**',
                '**/web/**',
                '**/backend/**',
                '**/ui/**',
                'react',
                'react/*',
                'next',
                'next/*',
                'payload',
                'payload/*',
                '@payloadcms/*',
              ],
              message:
                'API contracts must stay runtime-safe. Keep app, UI, React, Next, and Payload code out of this package.',
            },
          ],
        },
      ],
    },
  },
];

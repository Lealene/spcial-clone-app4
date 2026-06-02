import config from '@mvp-realty/eslint-config/nextjs';

export default [
  ...config,
  {
    ignores: [
      '.next/**',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'next-env.d.ts',
    ],
  },
];

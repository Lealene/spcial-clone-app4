import config from '@mvp-realty/eslint-config/nextjs';

export default [
  ...config,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];

import { fileURLToPath } from 'node:url';

import { mergeConfig, defineConfig } from 'vitest/config';
import base from '@mvp-realty/vitest-config/base';

export default mergeConfig(
  base,
  defineConfig({
    oxc: {
      jsx: {
        runtime: 'automatic',
        importSource: 'react',
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }),
);

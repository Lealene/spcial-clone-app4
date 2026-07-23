import { fileURLToPath } from 'node:url';

import { mergeConfig, defineConfig } from 'vitest/config';
import base from '@mvp-realty/vitest-config/base';

export default mergeConfig(
  base,
  defineConfig({
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }),
);

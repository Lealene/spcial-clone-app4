import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    PAYLOAD_SECRET: z.string().min(16),
    PAYLOAD_PUBLIC_SERVER_URL: z.string().url(),
    // Force Payload's Postgres schema "push" (dev-style auto-sync) on. Defaults
    // off so production never mutates schema implicitly; set 'true' only on
    // throwaway/review databases that have no migrations to run.
    DB_PUSH: z.enum(['true', 'false']).optional(),
    SENTRY_DSN: z.string().optional(),
    AXIOM_TOKEN: z.string().optional(),
    AXIOM_DATASET: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

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

    // Bridge MLS — required for sync jobs; optional so local CMS work can boot without them.
    BRIDGE_API_TOKEN: z.string().min(1).optional(),
    BRIDGE_DATASET_ID: z.string().min(1).optional(),
    BRIDGE_SYNC_CRON: z.string().default('0 3 * * *'),
    // Required once the manual sync endpoint ships (Phase 4).
    BRIDGE_SYNC_SECRET: z.string().min(16).optional(),

    // R2 via S3-compatible API. All-or-nothing — plugin enables only when complete.
    S3_BUCKET: z.string().min(1).optional(),
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_REGION: z.string().default('auto'),
    // Public origin for media URLs (custom domain or *.r2.dev). Not the API endpoint.
    S3_PUBLIC_URL: z.string().url().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export function hasBridgeConfig(): boolean {
  return Boolean(env.BRIDGE_API_TOKEN && env.BRIDGE_DATASET_ID);
}

export function hasS3StorageConfig(): boolean {
  return Boolean(
    env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_ENDPOINT,
  );
}

/** R2 S3 API host only — strip a trailing `/bucket` if pasted from the dashboard. */
export function getS3Endpoint(): string | undefined {
  if (!env.S3_ENDPOINT) return undefined;
  try {
    const url = new URL(env.S3_ENDPOINT);
    if (env.S3_BUCKET && url.pathname.replace(/^\//, '').split('/')[0] === env.S3_BUCKET) {
      url.pathname = '';
    }
    // Normalize: no trailing slash / path
    return `${url.protocol}//${url.host}`;
  } catch {
    return env.S3_ENDPOINT;
  }
}

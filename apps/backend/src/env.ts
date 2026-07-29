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

    // Shared secret the web app presents to POST /api/leads/submit. Without it
    // the ingest endpoint rejects every unauthenticated request.
    LEADS_INGEST_SECRET: z.string().min(16).optional(),

    // On-demand cache invalidation for the web app. Origin of the Next.js app
    // plus the bearer secret its /api/revalidate route checks. Both optional:
    // unset (as in local dev) means content edits fall back to the web app's
    // time-based revalidation instead of failing a save.
    WEB_APP_URL: z.string().url().optional(),
    CMS_REVALIDATE_SECRET: z.string().min(16).optional(),

    // Outbound SMTP, used for admin password resets and Wise Agent lead parsing.
    // SMTP rather than a provider SDK so switching providers is an env change.
    // Resend: host smtp.resend.com, port 465, user "resend", password = API key.
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(465),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASSWORD: z.string().min(1).optional(),
    // Implicit TLS. Defaults from the port (465 is SMTPS, 587/25 use STARTTLS).
    SMTP_SECURE: z.enum(['true', 'false']).optional(),
    // Must be on a domain verified with the provider or mail is rejected.
    EMAIL_FROM_ADDRESS: z.string().email().optional(),
    EMAIL_FROM_NAME: z.string().min(1).default('MVP Realty'),

    // Wise Agent CRM lead-capture (email parsing) address from
    // Integrations → Settings → API Keys and Lead Email. Wise Agent's
    // webconnect API only authenticates via OAuth, so leads are delivered as
    // parseable email instead. Optional — leads then sync as 'skipped'.
    WISE_AGENT_LEAD_EMAIL: z.string().email().optional(),

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

/** Both halves are required before the web app will accept an invalidation. */
export function hasRevalidateConfig(): boolean {
  return Boolean(env.WEB_APP_URL && env.CMS_REVALIDATE_SECRET);
}

/** Every field the nodemailer adapter needs before Payload can send anything. */
export function hasEmailConfig(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.EMAIL_FROM_ADDRESS);
}

/** Port 465 is implicit TLS; 587 and 25 upgrade via STARTTLS. */
export function isSmtpSecure(): boolean {
  if (env.SMTP_SECURE) return env.SMTP_SECURE === 'true';
  return env.SMTP_PORT === 465;
}

/** Lead sync needs both a destination address and a working mail transport. */
export function hasWiseAgentConfig(): boolean {
  return Boolean(env.WISE_AGENT_LEAD_EMAIL) && hasEmailConfig();
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

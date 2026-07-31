import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    SENTRY_AUTH_TOKEN: z.string().optional(),
    AXIOM_TOKEN: z.string().optional(),
    AXIOM_DATASET: z.string().optional(),
    // Bearer secret for the Payload lead ingest endpoint. Server-only — the
    // /api/leads route handler is the only thing that may read it.
    LEADS_INGEST_SECRET: z.string().min(16).optional(),
    // Bearer secret Payload presents to POST /api/revalidate. Must match the
    // backend's CMS_REVALIDATE_SECRET or content edits never invalidate the cache.
    CMS_REVALIDATE_SECRET: z.string().min(16).optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_BACKEND_URL: z.string().url(),
    // Public origin for Payload Media when served from R2/S3 (matches backend S3_PUBLIC_URL).
    NEXT_PUBLIC_MEDIA_URL: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    // Google Tag Manager container. Optional: leave unset and no tag loads, which
    // keeps dev and preview traffic out of the production container.
    NEXT_PUBLIC_GTM_ID: z
      .string()
      .regex(/^GTM-[A-Z0-9]+$/, 'Must be a GTM container ID, e.g. GTM-ABC1234')
      .optional(),
  },
  // Next.js < 13.4.4 only inlines NEXT_PUBLIC_ at build time; explicit map keeps
  // client-side access reliable.
  runtimeEnv: {
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    AXIOM_TOKEN: process.env.AXIOM_TOKEN,
    AXIOM_DATASET: process.env.AXIOM_DATASET,
    LEADS_INGEST_SECRET: process.env.LEADS_INGEST_SECRET,
    CMS_REVALIDATE_SECRET: process.env.CMS_REVALIDATE_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  },
  emptyStringAsUndefined: true,
});

import {
  CMS_CACHE_TAGS,
  privacyPolicyGlobalSchema,
  type PrivacyPolicyGlobal,
} from '@mvp-realty/api-contracts';

import { fetchJson } from './client';
import { lexicalToHtml } from './rich-text-html';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function isoDay(value: unknown): string | undefined {
  const raw = text(value);
  if (!raw) return undefined;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function normalizePrivacyPolicy(raw: unknown): PrivacyPolicyGlobal | null {
  if (!isRecord(raw)) return null;

  const parsed = privacyPolicyGlobalSchema.safeParse({
    title: text(raw.title) ?? 'Privacy Policy',
    lastUpdated: isoDay(raw.lastUpdated),
    intro: text(raw.intro),
    bodyHtml: lexicalToHtml(raw.body),
  });

  return parsed.success ? parsed.data : null;
}

/**
 * Returns null instead of throwing so the route can 404 deliberately. A legal page
 * that 500s is worse than one that is honestly missing.
 */
export async function getPrivacyPolicy(): Promise<PrivacyPolicyGlobal | null> {
  try {
    const raw = await fetchJson('/api/globals/privacy-policy?depth=1', {
      tags: [CMS_CACHE_TAGS.privacyPolicy],
    });
    return normalizePrivacyPolicy(raw);
  } catch {
    return null;
  }
}

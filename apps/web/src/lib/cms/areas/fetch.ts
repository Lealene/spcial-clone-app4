import { CMS_CACHE_TAGS, type AreaPdpMeta, type CommunityDetail } from '@mvp-realty/api-contracts';

import { fetchJson } from '../client';
import {
  normalizeAreaPdpMeta,
  normalizeCommunityAreaCard,
  normalizeCommunityAreaStripItem,
  normalizeCommunityDetail,
  type CommunityAreaCard,
  type CommunityAreaStripItem,
} from './normalize';

const AREAS_TAG = CMS_CACHE_TAGS.areas;

type PayloadListResponse = {
  docs?: unknown[];
};

function areasPath(query: string): string {
  return `/api/areas?${query}`;
}

async function fetchCommunityAreaDocs(): Promise<unknown[]> {
  const params = new URLSearchParams({
    'where[kind][equals]': 'community',
    sort: 'name',
    limit: '20',
    depth: '1',
  });

  const raw = (await fetchJson(areasPath(params.toString()), {
    tags: [AREAS_TAG],
  })) as PayloadListResponse;

  return raw.docs ?? [];
}

/** Homepage featured community cards — Payload Areas with kind=community. */
export async function getCommunityAreaCards(limit = 12): Promise<CommunityAreaCard[]> {
  const docs = await fetchCommunityAreaDocs();
  return docs
    .map(normalizeCommunityAreaCard)
    .filter((card): card is CommunityAreaCard => card !== null)
    .slice(0, limit);
}

/** Homepage communities strip — same Areas source as featured cards. */
export async function getCommunityAreaStripItems(limit = 3): Promise<CommunityAreaStripItem[]> {
  const docs = await fetchCommunityAreaDocs();
  return docs
    .map(normalizeCommunityAreaStripItem)
    .filter((item): item is CommunityAreaStripItem => item !== null)
    .slice(0, limit);
}

export async function getCommunityDetailBySlug(slug: string): Promise<CommunityDetail | null> {
  const params = new URLSearchParams({
    'where[slug][equals]': slug,
    'where[kind][equals]': 'community',
    limit: '1',
    depth: '3',
  });

  const raw = (await fetchJson(areasPath(params.toString()), {
    tags: [AREAS_TAG],
  })) as PayloadListResponse;

  const first = raw.docs?.[0];
  if (!first) return null;
  return normalizeCommunityDetail(first);
}

export async function getCommunityDetailSlugs(): Promise<string[]> {
  const params = new URLSearchParams({
    'where[kind][equals]': 'community',
    sort: 'name',
    limit: '50',
    depth: '0',
  });

  const raw = (await fetchJson(areasPath(params.toString()), {
    tags: [AREAS_TAG],
  })) as PayloadListResponse;

  return (raw.docs ?? [])
    .map((doc) =>
      typeof doc === 'object' &&
      doc !== null &&
      typeof (doc as { slug?: unknown }).slug === 'string'
        ? (doc as { slug: string }).slug
        : null,
    )
    .filter((slug): slug is string => Boolean(slug));
}

/** Minimal community identity used to build nav/footer links. */
export type CommunityNavItem = {
  slug: string;
  name: string;
};

function toCommunityNavItem(doc: unknown): CommunityNavItem | null {
  if (typeof doc !== 'object' || doc === null) return null;
  const { slug, name } = doc as { slug?: unknown; name?: unknown };
  if (typeof slug !== 'string' || typeof name !== 'string') return null;
  const trimmedSlug = slug.trim();
  const trimmedName = name.trim();
  if (!trimmedSlug || !trimmedName) return null;
  return { slug: trimmedSlug, name: trimmedName };
}

/** Slug + name only, for auto-generated community link lists (footer columns). */
export async function getCommunityNavItems(limit = 12): Promise<CommunityNavItem[]> {
  const params = new URLSearchParams({
    'where[kind][equals]': 'community',
    sort: 'name',
    limit: String(Math.max(1, limit)),
    depth: '0',
  });

  const raw = (await fetchJson(areasPath(params.toString()), {
    tags: [AREAS_TAG],
  })) as PayloadListResponse;

  return (raw.docs ?? [])
    .map(toCommunityNavItem)
    .filter((item): item is CommunityNavItem => item !== null);
}

/** Lean meta for listing PDP community facts + soldCount. */
export async function getAreaPdpMeta(slug: string): Promise<AreaPdpMeta | null> {
  const params = new URLSearchParams({
    'where[slug][equals]': slug,
    'where[kind][equals]': 'community',
    limit: '1',
    depth: '1',
  });

  const raw = (await fetchJson(areasPath(params.toString()), {
    tags: [AREAS_TAG],
  })) as PayloadListResponse;

  const first = raw.docs?.[0];
  if (!first) return null;
  return normalizeAreaPdpMeta(first);
}

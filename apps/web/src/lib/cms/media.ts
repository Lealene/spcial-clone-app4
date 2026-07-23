import { env } from '@/env';

export type RawPayloadMedia = {
  url?: unknown;
  alt?: unknown;
  width?: unknown;
  height?: unknown;
};

export type RawMediaField = {
  image?: unknown;
  altOverride?: unknown;
  caption?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toAbsoluteMediaUrl(url: string): string {
  if (url.startsWith('/images/')) return url;
  if (url.startsWith('/')) return new URL(url, env.NEXT_PUBLIC_BACKEND_URL).toString();

  try {
    const parsed = new URL(url);
    const backend = new URL(env.NEXT_PUBLIC_BACKEND_URL);
    if (parsed.origin === backend.origin) return parsed.toString();
  } catch {
    return url;
  }

  return url;
}

const fallbackImageSrc = '/images/hero-naples-waterfront.jpg';

export function normalizeMediaField(field: unknown, fallbackAlt = '') {
  if (!isRecord(field)) return { src: fallbackImageSrc, alt: fallbackAlt || 'Image' };

  const image = field.image;
  const media = isRecord(image) ? image : undefined;
  const rawUrl = typeof media?.url === 'string' && media.url ? media.url : fallbackImageSrc;
  const rawAlt = typeof media?.alt === 'string' ? media.alt : fallbackAlt;
  const altOverride = typeof field.altOverride === 'string' ? field.altOverride : undefined;
  const caption = typeof field.caption === 'string' ? field.caption : undefined;

  return {
    src: toAbsoluteMediaUrl(rawUrl),
    alt: altOverride || rawAlt || 'Image',
    width: typeof media?.width === 'number' ? media.width : undefined,
    height: typeof media?.height === 'number' ? media.height : undefined,
    caption,
  };
}

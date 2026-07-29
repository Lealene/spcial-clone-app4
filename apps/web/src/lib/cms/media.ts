import { cmsImageSchema, type CmsImage } from '@mvp-realty/api-contracts';

import { env } from '@/env';

export type RawPayloadMedia = {
  url?: unknown;
  alt?: unknown;
  width?: unknown;
  height?: unknown;
  mimeType?: unknown;
};

export type RawMediaField = {
  image?: unknown;
  altOverride?: unknown;
  caption?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function allowedMediaOrigins(): string[] {
  const origins = [new URL(env.NEXT_PUBLIC_BACKEND_URL).origin];
  if (env.NEXT_PUBLIC_MEDIA_URL) {
    origins.push(new URL(env.NEXT_PUBLIC_MEDIA_URL).origin);
  }
  return origins;
}

function toAbsoluteMediaUrl(url: string): string | null {
  if (url.startsWith('//')) return null;
  if (url.startsWith('/images/')) return url;
  if (url.startsWith('/')) return new URL(url, env.NEXT_PUBLIC_BACKEND_URL).toString();

  try {
    const parsed = new URL(url);
    if (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      allowedMediaOrigins().includes(parsed.origin)
    ) {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeMediaField(field: unknown, fallbackAlt?: string): CmsImage {
  if (!isRecord(field)) {
    throw new Error('CMS media field must contain a populated media object.');
  }

  const media = isRecord(field.image) ? field.image : text(field.url) ? field : undefined;
  if (!media) throw new Error('CMS media field must contain a populated media object.');
  const mimeType = text(media.mimeType);
  if (mimeType && !mimeType.startsWith('image/')) {
    throw new Error('CMS media field must reference an image.');
  }

  const rawUrl = text(media.url);
  const src = rawUrl ? toAbsoluteMediaUrl(rawUrl) : null;
  const alt = text(field.altOverride) ?? text(media.alt) ?? text(fallbackAlt);
  if (!src || !alt) throw new Error('CMS media field is missing a valid URL or alt text.');

  return cmsImageSchema.parse({
    src,
    alt,
    width: typeof media.width === 'number' && media.width > 0 ? media.width : undefined,
    height: typeof media.height === 'number' && media.height > 0 ? media.height : undefined,
    caption: text(field.caption),
  });
}

export function normalizeOptionalMediaField(
  field: unknown,
  fallbackAlt?: string,
): CmsImage | undefined {
  try {
    return normalizeMediaField(field, fallbackAlt);
  } catch {
    return undefined;
  }
}

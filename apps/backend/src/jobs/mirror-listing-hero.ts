import type { Payload, TaskConfig } from 'payload';

import { hasS3StorageConfig } from '../env';
import { DISABLE_REVALIDATE } from '../hooks/revalidate';
import { putPublicObject } from '../services/s3';

/**
 * Mirrored images are plumbing for a listing, not standalone library media, so
 * they skip Media's blanket invalidation — the listing update below covers them.
 */
const MIRROR_CONTEXT = { [DISABLE_REVALIDATE]: true };

function extensionFromContentType(contentType: string | null): string {
  if (!contentType) return 'jpg';
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  return 'jpg';
}

/**
 * Download a remote image and create a Media document (R2 when S3 env is set).
 * Reusable for full-gallery mirror later.
 */
export async function mirrorRemoteImageToMedia(
  payload: Payload,
  args: {
    url: string;
    alt: string;
    filenamePrefix: string;
  },
): Promise<number | string> {
  const response = await fetch(args.url);
  if (!response.ok) {
    throw new Error(`Failed to download image (${response.status}): ${args.url}`);
  }

  const contentType = response.headers.get('content-type');
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = extensionFromContentType(contentType);
  const filename = `${args.filenamePrefix}.${ext}`;
  const mimeType = contentType?.split(';')[0] || 'image/jpeg';

  const media = await payload.create({
    collection: 'media',
    data: {
      alt: args.alt,
    },
    file: {
      data: buffer,
      mimetype: mimeType,
      name: filename,
      size: buffer.length,
    },
    overrideAccess: true,
    context: MIRROR_CONTEXT,
  });

  // Payload's storage adapter can skip/fail the object write; ensure R2 has the bytes.
  if (hasS3StorageConfig() && typeof media.filename === 'string' && media.filename.length > 0) {
    await putPublicObject({
      key: media.filename,
      body: buffer,
      contentType: mimeType,
    });
  }

  return media.id;
}

export async function mirrorListingHero(
  payload: Payload,
  listingId: number | string,
  options: { force?: boolean } = {},
): Promise<{ skipped: boolean; mediaId?: number | string }> {
  const listing = await payload.findByID({
    collection: 'listings',
    id: listingId,
    depth: 0,
    overrideAccess: true,
  });

  const primary = listing.gallery?.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];

  if (!primary?.url || !primary.mediaKey) {
    return { skipped: true };
  }

  if (!options.force && listing.heroImage && listing.heroMediaKey === primary.mediaKey) {
    return { skipped: true };
  }

  const mediaId = await mirrorRemoteImageToMedia(payload, {
    url: primary.url,
    alt: `${listing.fullAddress} — primary photo`,
    filenamePrefix: `listing-${listing.mlsId}-hero`,
  });

  await payload.update({
    collection: 'listings',
    id: listingId,
    data: {
      heroImage: typeof mediaId === 'number' ? mediaId : Number(mediaId),
      heroMediaKey: primary.mediaKey,
    },
    overrideAccess: true,
  });

  return { skipped: false, mediaId };
}

/** Remirror heroes for listings missing heroImage (or all when force). */
export async function remirrorListingHeroes(
  payload: Payload,
  options: { force?: boolean; limit?: number } = {},
): Promise<{ mirrored: number; skipped: number; errors: string[] }> {
  const force = options.force ?? false;
  const max = options.limit ?? 5000;
  let mirrored = 0;
  let skipped = 0;
  const errors: string[] = [];
  let page = 1;
  let processed = 0;

  while (processed < max) {
    const batch = await payload.find({
      collection: 'listings',
      where: force
        ? undefined
        : {
            heroImage: { exists: false },
          },
      limit: Math.min(50, max - processed),
      page,
      depth: 0,
      overrideAccess: true,
    });

    if (batch.docs.length === 0) break;

    for (const listing of batch.docs) {
      if (processed >= max) break;
      processed += 1;
      try {
        const result = await mirrorListingHero(payload, listing.id, { force });
        if (result.skipped) skipped += 1;
        else mirrored += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`listing ${listing.id} (${listing.mlsId}): ${message}`);
        payload.logger.error({ err: error, listingId: listing.id, msg: 'Hero remirror failed' });
      }
    }

    if (!batch.hasNextPage) break;
    // When filtering exists:false, successfully mirrored docs leave the result set —
    // stay on page 1. When force, advance pages.
    if (force) page += 1;
  }

  return { mirrored, skipped, errors };
}

type MirrorHeroInput = {
  listingId: string;
};

export const mirrorListingHeroTask = {
  slug: 'mirrorListingHero',
  label: 'Mirror listing hero image',
  inputSchema: [{ name: 'listingId', type: 'text', required: true }],
  outputSchema: [
    { name: 'skipped', type: 'checkbox', required: true },
    { name: 'mediaId', type: 'text' },
  ],
  retries: 3,
  handler: async ({ input, req }) => {
    const { listingId } = input as MirrorHeroInput;
    const result = await mirrorListingHero(req.payload, listingId);
    return {
      output: {
        skipped: result.skipped,
        mediaId: result.mediaId != null ? String(result.mediaId) : undefined,
      },
    };
  },
} as TaskConfig;

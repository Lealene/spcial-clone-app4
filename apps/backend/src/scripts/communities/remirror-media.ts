import type { Payload } from 'payload';

import {
  communitySeedAssets,
  type CommunitySeedAssetKey,
} from '../../../seed/communities/manifest';
import { env, hasS3StorageConfig } from '../../env';
import { putPublicObject } from '../../services/s3';
import { loadCommunitySeedAsset, toPayloadFile } from './assets';

const SEED_CONTEXT = { source: 'remirror-community-media' };

/**
 * Force-reupload community seed media so bytes land in R2 after enabling S3 storage.
 * Creates missing Media docs when needed; keeps IDs stable when docs already exist.
 *
 * Payload `create`/`update({ file })` with an existing filename can skip the storage
 * adapter write; when S3 is configured we PutObject the key directly.
 */
export async function remirrorCommunityMedia(payload: Payload): Promise<{
  updated: Array<{ key: CommunitySeedAssetKey; id: number; url: string | null | undefined }>;
  missing: CommunitySeedAssetKey[];
  created: CommunitySeedAssetKey[];
}> {
  if (!hasS3StorageConfig() || !env.S3_PUBLIC_URL) {
    throw new Error(
      'S3 storage is not fully configured. Set S3_BUCKET, credentials, S3_ENDPOINT, and S3_PUBLIC_URL.',
    );
  }

  const updated: Array<{
    key: CommunitySeedAssetKey;
    id: number;
    url: string | null | undefined;
  }> = [];
  const missing: CommunitySeedAssetKey[] = [];
  const created: CommunitySeedAssetKey[] = [];

  for (const key of Object.keys(communitySeedAssets) as CommunitySeedAssetKey[]) {
    const asset = await loadCommunitySeedAsset(key);
    const existing = await payload.find({
      collection: 'media',
      where: {
        or: [{ alt: { equals: asset.alt } }, { filename: { equals: asset.uploadName } }],
      },
      limit: 5,
      depth: 0,
      overrideAccess: true,
    });

    let doc = existing.docs.find(
      (candidate) => candidate.filename === asset.uploadName || candidate.alt === asset.alt,
    );

    if (!doc) {
      doc = await payload.create({
        collection: 'media',
        data: { alt: asset.alt },
        file: toPayloadFile(asset),
        overrideAccess: true,
        context: SEED_CONTEXT,
      });
      created.push(key);
    }

    await putPublicObject({
      key: asset.uploadName,
      body: asset.data,
      contentType: asset.mimeType,
    });

    const refreshed = await payload.update({
      collection: 'media',
      id: doc.id,
      data: { alt: asset.alt },
      overrideAccess: true,
      context: SEED_CONTEXT,
    });

    const publicUrl = `${env.S3_PUBLIC_URL.replace(/\/$/, '')}/${asset.uploadName}`;

    updated.push({
      key,
      id: typeof refreshed.id === 'number' ? refreshed.id : Number(refreshed.id),
      url: publicUrl,
    });
  }

  return { updated, missing, created };
}

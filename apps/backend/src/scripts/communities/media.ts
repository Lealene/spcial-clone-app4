import type { Payload } from 'payload';

import type { Media } from '@/payload-types';

import {
  assetKeyForCommunitySeedFileName,
  checksumMatchesCommunitySeedFileName,
  cleanupCommunitySeedMediaFiles,
  loadCommunitySeedAsset,
  toPayloadFile,
  type LoadedCommunitySeedAsset,
} from './assets';
import { checksumForMediaFile } from '../shared/seed-assets';
import { backendMediaDir } from '../shared/media-paths';
import {
  communitySeedAssets,
  type CommunitySeedAssetKey,
} from '../../../seed/communities/manifest';

const SEED_CONTEXT = { source: 'seed-communities-local' };

export type CommunitySeedMediaDoc = Pick<Media, 'id' | 'alt' | 'filename' | 'url'>;
export type CommunitySeedMediaDocs = Record<CommunitySeedAssetKey, CommunitySeedMediaDoc>;

async function findMatchingMedia(
  docs: CommunitySeedMediaDoc[],
  asset: LoadedCommunitySeedAsset,
): Promise<CommunitySeedMediaDoc | undefined> {
  const candidates = docs.filter(
    (doc) =>
      doc.alt === asset.alt ||
      (typeof doc.filename === 'string' &&
        assetKeyForCommunitySeedFileName(doc.filename) === asset.key),
  );
  const matching: CommunitySeedMediaDoc[] = [];
  let canonicalAltConflict = false;

  for (const candidate of candidates) {
    if (!candidate.filename) {
      if (candidate.alt === asset.alt) canonicalAltConflict = true;
      continue;
    }

    if (
      candidate.filename === asset.uploadName ||
      checksumMatchesCommunitySeedFileName(candidate.filename, asset.sha256)
    ) {
      if (candidate.alt === asset.alt || !candidate.alt) {
        matching.push(candidate);
        continue;
      }
    }

    const checksum = await checksumForMediaFile(candidate.filename, backendMediaDir);
    if (checksum === asset.sha256) {
      matching.push(candidate);
      continue;
    }

    if (candidate.alt === asset.alt) canonicalAltConflict = true;
  }

  if (matching.length > 1) {
    throw new Error(`Multiple media records match community seed asset ${asset.key}.`);
  }

  const match = matching[0];
  if (match && match.alt !== asset.alt) {
    throw new Error(
      `Media ${String(match.id)} matches community seed asset ${asset.key}, but its alt text was edited.`,
    );
  }

  if (!match && canonicalAltConflict) {
    throw new Error(
      `Media using the canonical alt text for community seed asset ${asset.key} has missing or changed bytes.`,
    );
  }

  return match;
}

async function loadMediaDocs(payload: Payload): Promise<CommunitySeedMediaDoc[]> {
  const docs: CommunitySeedMediaDoc[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await payload.find({
      collection: 'media',
      limit: 100,
      page,
      depth: 0,
      overrideAccess: true,
    });

    docs.push(...(result.docs as CommunitySeedMediaDoc[]));
    hasNextPage = result.hasNextPage;
    page += 1;
  }

  return docs;
}

export async function reconcileCommunitySeedMedia(payload: Payload): Promise<{
  mediaDocs: CommunitySeedMediaDocs;
  created: CommunitySeedAssetKey[];
  removedOrphanFileNames: string[];
  preservedModifiedFileNames: string[];
}> {
  const docs = await loadMediaDocs(payload);
  const referencedFileNames = new Set(
    docs.flatMap((doc) => (typeof doc.filename === 'string' ? [doc.filename] : [])),
  );
  const cleanup = await cleanupCommunitySeedMediaFiles(referencedFileNames);
  const created: CommunitySeedAssetKey[] = [];
  const resolved = {} as CommunitySeedMediaDocs;

  for (const key of Object.keys(communitySeedAssets) as CommunitySeedAssetKey[]) {
    const asset = await loadCommunitySeedAsset(key);
    const existing = await findMatchingMedia(docs, asset);

    if (existing) {
      resolved[key] = existing;
      continue;
    }

    const createdDoc = (await payload.create({
      collection: 'media',
      data: { alt: asset.alt },
      file: toPayloadFile(asset),
      overrideAccess: true,
      context: SEED_CONTEXT,
    })) as CommunitySeedMediaDoc;

    docs.push(createdDoc);
    resolved[key] = createdDoc;
    created.push(key);
  }

  return {
    mediaDocs: resolved,
    created,
    removedOrphanFileNames: cleanup.orphanFileNames,
    preservedModifiedFileNames: cleanup.modifiedFileNames,
  };
}

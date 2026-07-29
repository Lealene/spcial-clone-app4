import type { Payload } from 'payload';

import type { Media } from '@/payload-types';

import {
  assetKeyForSeedFileName,
  checksumForMediaFile,
  checksumMatchesSeedFileName,
  cleanupHomepageSeedMediaFiles,
  inspectHomepageSeedMediaFiles,
  loadHomepageSeedAsset,
  toPayloadFile,
  type LoadedHomepageSeedAsset,
} from './assets';
import { homepageSeedAssets, type HomepageSeedAssetKey } from '../../../seed/homepage/manifest';

const SEED_CONTEXT = { source: 'seed-homepage-local' };

export type HomepageSeedMediaDoc = Pick<Media, 'id' | 'alt' | 'filename' | 'url'>;
export type HomepageSeedMediaDocs = Record<HomepageSeedAssetKey, HomepageSeedMediaDoc>;

export function placeholderHomepageSeedMedia(): HomepageSeedMediaDocs {
  return Object.fromEntries(
    (
      Object.entries(homepageSeedAssets) as Array<
        [HomepageSeedAssetKey, (typeof homepageSeedAssets)[HomepageSeedAssetKey]]
      >
    ).map(([key, asset]) => [key, { id: 0, alt: asset.alt, filename: null, url: null }]),
  ) as HomepageSeedMediaDocs;
}

async function findMatchingMedia(
  docs: HomepageSeedMediaDoc[],
  asset: LoadedHomepageSeedAsset,
  options: { allowPriorManagedVersion?: boolean } = {},
): Promise<HomepageSeedMediaDoc | undefined> {
  const candidates = docs.filter(
    (doc) =>
      doc.alt === asset.alt ||
      (typeof doc.filename === 'string' && assetKeyForSeedFileName(doc.filename) === asset.key),
  );
  const matching: HomepageSeedMediaDoc[] = [];
  const priorManagedVersions: HomepageSeedMediaDoc[] = [];
  let canonicalAltConflict = false;

  for (const candidate of candidates) {
    if (!candidate.filename) {
      if (candidate.alt === asset.alt) canonicalAltConflict = true;
      continue;
    }

    // Canonical managed name (works when bytes live in R2 and not on local disk).
    if (
      candidate.filename === asset.uploadName ||
      checksumMatchesSeedFileName(candidate.filename, asset.sha256)
    ) {
      if (candidate.alt === asset.alt || !candidate.alt) {
        matching.push(candidate);
        continue;
      }
    }

    const checksum = await checksumForMediaFile(candidate.filename);
    if (checksum === asset.sha256) {
      matching.push(candidate);
      continue;
    }

    const isPriorManagedVersion =
      candidate.filename.startsWith('seed-homepage--') &&
      typeof checksum === 'string' &&
      checksumMatchesSeedFileName(candidate.filename, checksum);
    if (candidate.alt === asset.alt && isPriorManagedVersion) priorManagedVersions.push(candidate);
    else if (candidate.alt === asset.alt) canonicalAltConflict = true;
  }

  if (matching.length > 1) {
    throw new Error(`Multiple media records match homepage seed asset ${asset.key}.`);
  }

  const match = matching[0];
  if (match && match.alt !== asset.alt) {
    throw new Error(
      `Media ${String(match.id)} matches homepage seed asset ${asset.key}, but its alt text was edited.`,
    );
  }

  if (!match && options.allowPriorManagedVersion) {
    if (priorManagedVersions.length > 1) {
      throw new Error(`Multiple prior media versions match homepage seed asset ${asset.key}.`);
    }
    if (priorManagedVersions[0]) return priorManagedVersions[0];
  }

  if (!match && canonicalAltConflict) {
    throw new Error(
      `Media using the canonical alt text for homepage seed asset ${asset.key} has missing or changed bytes.`,
    );
  }

  return match;
}

async function loadMediaDocs(payload: Payload): Promise<HomepageSeedMediaDoc[]> {
  const docs: HomepageSeedMediaDoc[] = [];
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

    docs.push(...(result.docs as HomepageSeedMediaDoc[]));
    hasNextPage = result.hasNextPage;
    page += 1;
  }

  return docs;
}

export async function reconcileHomepageSeedMedia(payload: Payload): Promise<{
  mediaDocs: HomepageSeedMediaDocs;
  created: HomepageSeedAssetKey[];
  removedOrphanFileNames: string[];
  preservedModifiedFileNames: string[];
}> {
  const docs = await loadMediaDocs(payload);
  const referencedFileNames = new Set(
    docs.flatMap((doc) => (typeof doc.filename === 'string' ? [doc.filename] : [])),
  );
  const cleanup = await cleanupHomepageSeedMediaFiles(referencedFileNames);
  const created: HomepageSeedAssetKey[] = [];
  const resolved = {} as HomepageSeedMediaDocs;

  for (const key of Object.keys(homepageSeedAssets) as HomepageSeedAssetKey[]) {
    const asset = await loadHomepageSeedAsset(key);
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
    })) as HomepageSeedMediaDoc;

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

async function resolveHomepageSeedMedia(
  payload: Payload,
  allowPriorManagedVersion: boolean,
): Promise<HomepageSeedMediaDocs> {
  const docs = await loadMediaDocs(payload);
  const resolved = {} as HomepageSeedMediaDocs;

  for (const key of Object.keys(homepageSeedAssets) as HomepageSeedAssetKey[]) {
    const asset = await loadHomepageSeedAsset(key);
    const existing = await findMatchingMedia(docs, asset, { allowPriorManagedVersion });
    if (!existing) throw new Error(`Missing homepage seed media ${key}.`);
    resolved[key] = existing;
  }

  return resolved;
}

export function findHomepageSeedMedia(payload: Payload): Promise<HomepageSeedMediaDocs> {
  return resolveHomepageSeedMedia(payload, false);
}

export function findHomepageSeedMediaForExistingPage(
  payload: Payload,
): Promise<HomepageSeedMediaDocs> {
  return resolveHomepageSeedMedia(payload, true);
}

export async function inspectHomepageMediaOrphans(payload: Payload) {
  const docs = await loadMediaDocs(payload);
  const referencedFileNames = new Set(
    docs.flatMap((doc) => (typeof doc.filename === 'string' ? [doc.filename] : [])),
  );
  return inspectHomepageSeedMediaFiles(referencedFileNames);
}

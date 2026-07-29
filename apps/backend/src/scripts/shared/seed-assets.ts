/**
 * Shared checksummed seed-asset helpers.
 * Filename prefix is `seed-<namespace>--<key>--<sha12><ext>`.
 */
import { createHash } from 'node:crypto';
import { readFile, readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

import type { File } from 'payload';

export type SeedAssetEntry = {
  fileName: string;
  alt: string;
  mimeType: string;
  sha256: string;
};

export type LoadedSeedAsset<TKey extends string = string> = {
  key: TKey;
  namespace: string;
  alt: string;
  fileName: string;
  mimeType: string;
  sha256: string;
  data: Buffer;
  size: number;
  uploadName: string;
};

export function sha256(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

export function seedUploadName(
  namespace: string,
  key: string,
  checksum: string,
  fileName: string,
): string {
  const extension = path.extname(fileName);
  return `seed-${namespace}--${key}--${checksum.slice(0, 12)}${extension}`;
}

export function seedFileMatch(fileName: string): RegExpMatchArray | null {
  return fileName.match(/^seed-([A-Za-z0-9]+)--([A-Za-z0-9]+)--([a-f0-9]{12})(\.[A-Za-z0-9]+)$/);
}

export async function loadSeedAsset<TKey extends string>(
  assetsDir: string,
  namespace: string,
  key: TKey,
  asset: SeedAssetEntry,
): Promise<LoadedSeedAsset<TKey>> {
  const filePath = path.join(assetsDir, asset.fileName);
  const [data, stats] = await Promise.all([readFile(filePath), stat(filePath)]);
  const actualChecksum = sha256(data);

  if (actualChecksum !== asset.sha256) {
    throw new Error(
      `Seed asset ${asset.fileName} has checksum ${actualChecksum}; expected ${asset.sha256}.`,
    );
  }

  return {
    key,
    namespace,
    alt: asset.alt,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    sha256: asset.sha256,
    data,
    size: stats.size,
    uploadName: seedUploadName(namespace, key, asset.sha256, asset.fileName),
  };
}

export function toPayloadFile(asset: LoadedSeedAsset): File {
  return {
    data: asset.data,
    mimetype: asset.mimeType,
    name: asset.uploadName,
    size: asset.size,
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function assetKeyForSeedFileName<TKey extends string>(
  fileName: string,
  namespace: string,
  manifest: Record<TKey, SeedAssetEntry>,
  uploadNameForKey: (key: TKey) => string,
): TKey | undefined {
  const generatedMatch = seedFileMatch(fileName);
  if (generatedMatch?.[1] === namespace) {
    const generatedKey = generatedMatch[2];
    if (generatedKey && generatedKey in manifest) return generatedKey as TKey;
  }

  for (const [key, asset] of Object.entries(manifest) as Array<[TKey, SeedAssetEntry]>) {
    if (fileName === uploadNameForKey(key)) return key;

    const extension = path.extname(asset.fileName);
    const stem = path.basename(asset.fileName, extension);
    const legacyPattern = new RegExp(
      `^${escapeRegExp(stem)}(?:-[0-9]+)?${escapeRegExp(extension)}$`,
    );
    if (legacyPattern.test(fileName)) return key;
  }

  return undefined;
}

export function checksumMatchesSeedFileName(fileName: string, checksum: string): boolean {
  const generatedMatch = seedFileMatch(fileName);
  if (generatedMatch) return checksum.startsWith(generatedMatch[3] ?? '');
  return false;
}

export async function checksumForMediaFile(
  fileName: string,
  mediaDir: string,
): Promise<string | undefined> {
  try {
    return sha256(await readFile(path.join(mediaDir, fileName)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

export type SeedMediaFileInspection = {
  orphanFileNames: string[];
  modifiedFileNames: string[];
};

export async function inspectSeedMediaFiles<TKey extends string>(
  referencedFileNames: ReadonlySet<string>,
  mediaDir: string,
  namespace: string,
  manifest: Record<TKey, SeedAssetEntry>,
  uploadNameForKey: (key: TKey) => string,
): Promise<SeedMediaFileInspection> {
  let fileNames: string[];

  try {
    fileNames = (await readdir(mediaDir, { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { orphanFileNames: [], modifiedFileNames: [] };
    }
    throw error;
  }

  const orphanFileNames: string[] = [];
  const modifiedFileNames: string[] = [];

  for (const fileName of fileNames) {
    const key = assetKeyForSeedFileName(fileName, namespace, manifest, uploadNameForKey);
    if (!key || referencedFileNames.has(fileName)) continue;

    const checksum = await checksumForMediaFile(fileName, mediaDir);
    if (
      checksum &&
      (checksumMatchesSeedFileName(fileName, checksum) || manifest[key].sha256 === checksum)
    ) {
      orphanFileNames.push(fileName);
    } else {
      modifiedFileNames.push(fileName);
    }
  }

  return { orphanFileNames, modifiedFileNames };
}

export async function cleanupSeedMediaFiles<TKey extends string>(
  referencedFileNames: ReadonlySet<string>,
  mediaDir: string,
  namespace: string,
  manifest: Record<TKey, SeedAssetEntry>,
  uploadNameForKey: (key: TKey) => string,
): Promise<SeedMediaFileInspection> {
  const inspection = await inspectSeedMediaFiles(
    referencedFileNames,
    mediaDir,
    namespace,
    manifest,
    uploadNameForKey,
  );

  await Promise.all(
    inspection.orphanFileNames.map((fileName) => unlink(path.join(mediaDir, fileName))),
  );

  return inspection;
}

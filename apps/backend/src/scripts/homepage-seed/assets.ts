import { createHash } from 'node:crypto';
import { readFile, readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { File } from 'payload';

import { homepageSeedAssets, type HomepageSeedAssetKey } from '../../../seed/homepage/manifest';

export const homepageSeedAssetsDir = fileURLToPath(
  new URL('../../../seed/homepage/assets/', import.meta.url),
);
export const backendMediaDir = fileURLToPath(new URL('../../../media/', import.meta.url));

export type LoadedHomepageSeedAsset = {
  key: HomepageSeedAssetKey;
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

export function homepageSeedUploadName(key: HomepageSeedAssetKey): string {
  const asset = homepageSeedAssets[key];
  const extension = path.extname(asset.fileName);
  return `seed-homepage--${key}--${asset.sha256.slice(0, 12)}${extension}`;
}

export async function loadHomepageSeedAsset(
  key: HomepageSeedAssetKey,
): Promise<LoadedHomepageSeedAsset> {
  const asset = homepageSeedAssets[key];
  const filePath = path.join(homepageSeedAssetsDir, asset.fileName);
  const [data, stats] = await Promise.all([readFile(filePath), stat(filePath)]);
  const actualChecksum = sha256(data);

  if (actualChecksum !== asset.sha256) {
    throw new Error(
      `Homepage seed asset ${asset.fileName} has checksum ${actualChecksum}; expected ${asset.sha256}.`,
    );
  }

  return {
    key,
    alt: asset.alt,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    sha256: asset.sha256,
    data,
    size: stats.size,
    uploadName: homepageSeedUploadName(key),
  };
}

export async function validateHomepageSeedAssets(): Promise<void> {
  await Promise.all(
    (Object.keys(homepageSeedAssets) as HomepageSeedAssetKey[]).map(loadHomepageSeedAsset),
  );
}

export function toPayloadFile(asset: LoadedHomepageSeedAsset): File {
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

function generatedSeedFileMatch(fileName: string): RegExpMatchArray | null {
  return fileName.match(/^seed-homepage--([A-Za-z0-9]+)--([a-f0-9]{12})(\.[A-Za-z0-9]+)$/);
}

export function checksumMatchesSeedFileName(fileName: string, checksum: string): boolean {
  const generatedMatch = generatedSeedFileMatch(fileName);
  if (generatedMatch) return checksum.startsWith(generatedMatch[2] ?? '');

  const key = assetKeyForSeedFileName(fileName);
  return key ? checksum === homepageSeedAssets[key].sha256 : false;
}

export function assetKeyForSeedFileName(fileName: string): HomepageSeedAssetKey | undefined {
  const generatedMatch = generatedSeedFileMatch(fileName);
  const generatedKey = generatedMatch?.[1];
  if (generatedKey && generatedKey in homepageSeedAssets) {
    return generatedKey as HomepageSeedAssetKey;
  }

  for (const [key, asset] of Object.entries(homepageSeedAssets) as Array<
    [HomepageSeedAssetKey, (typeof homepageSeedAssets)[HomepageSeedAssetKey]]
  >) {
    if (fileName === homepageSeedUploadName(key)) return key;

    const extension = path.extname(asset.fileName);
    const stem = path.basename(asset.fileName, extension);
    const legacyPattern = new RegExp(
      `^${escapeRegExp(stem)}(?:-[0-9]+)?${escapeRegExp(extension)}$`,
    );
    if (legacyPattern.test(fileName)) return key;
  }

  return undefined;
}

export async function checksumForMediaFile(
  fileName: string,
  mediaDir = backendMediaDir,
): Promise<string | undefined> {
  try {
    return sha256(await readFile(path.join(mediaDir, fileName)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

export type HomepageSeedMediaFileInspection = {
  orphanFileNames: string[];
  modifiedFileNames: string[];
};

export async function inspectHomepageSeedMediaFiles(
  referencedFileNames: ReadonlySet<string>,
  mediaDir = backendMediaDir,
): Promise<HomepageSeedMediaFileInspection> {
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
    const key = assetKeyForSeedFileName(fileName);
    if (!key || referencedFileNames.has(fileName)) continue;

    const checksum = await checksumForMediaFile(fileName, mediaDir);
    if (checksum && checksumMatchesSeedFileName(fileName, checksum)) orphanFileNames.push(fileName);
    else modifiedFileNames.push(fileName);
  }

  return { orphanFileNames, modifiedFileNames };
}

export async function cleanupHomepageSeedMediaFiles(
  referencedFileNames: ReadonlySet<string>,
  mediaDir = backendMediaDir,
): Promise<HomepageSeedMediaFileInspection> {
  const inspection = await inspectHomepageSeedMediaFiles(referencedFileNames, mediaDir);

  await Promise.all(
    inspection.orphanFileNames.map((fileName) => unlink(path.join(mediaDir, fileName))),
  );

  return inspection;
}

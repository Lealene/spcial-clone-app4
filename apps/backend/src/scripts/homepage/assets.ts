import { fileURLToPath } from 'node:url';

import {
  assetKeyForSeedFileName as assetKeyForSeedFileNameShared,
  checksumForMediaFile as checksumForMediaFileShared,
  checksumMatchesSeedFileName as checksumMatchesSeedFileNameShared,
  cleanupSeedMediaFiles,
  inspectSeedMediaFiles,
  loadSeedAsset,
  seedUploadName,
  sha256,
  toPayloadFile,
  type LoadedSeedAsset,
} from '../shared/seed-assets';
import { backendMediaDir } from '../shared/media-paths';
import { homepageSeedAssets, type HomepageSeedAssetKey } from '../../../seed/homepage/manifest';

export const HOMEPAGE_SEED_NAMESPACE = 'homepage';

export const homepageSeedAssetsDir = fileURLToPath(
  new URL('../../../seed/homepage/assets/', import.meta.url),
);

export { backendMediaDir };

export type LoadedHomepageSeedAsset = LoadedSeedAsset<HomepageSeedAssetKey>;

export { sha256, toPayloadFile };

export function homepageSeedUploadName(key: HomepageSeedAssetKey): string {
  const asset = homepageSeedAssets[key];
  return seedUploadName(HOMEPAGE_SEED_NAMESPACE, key, asset.sha256, asset.fileName);
}

export async function loadHomepageSeedAsset(
  key: HomepageSeedAssetKey,
): Promise<LoadedHomepageSeedAsset> {
  return loadSeedAsset(
    homepageSeedAssetsDir,
    HOMEPAGE_SEED_NAMESPACE,
    key,
    homepageSeedAssets[key],
  );
}

export async function validateHomepageSeedAssets(): Promise<void> {
  await Promise.all(
    (Object.keys(homepageSeedAssets) as HomepageSeedAssetKey[]).map(loadHomepageSeedAsset),
  );
}

export function checksumMatchesSeedFileName(fileName: string, checksum: string): boolean {
  if (checksumMatchesSeedFileNameShared(fileName, checksum)) return true;

  const key = assetKeyForSeedFileName(fileName);
  return key ? checksum === homepageSeedAssets[key].sha256 : false;
}

export function assetKeyForSeedFileName(fileName: string): HomepageSeedAssetKey | undefined {
  return assetKeyForSeedFileNameShared(
    fileName,
    HOMEPAGE_SEED_NAMESPACE,
    homepageSeedAssets,
    homepageSeedUploadName,
  );
}

export async function checksumForMediaFile(
  fileName: string,
  mediaDir = backendMediaDir,
): Promise<string | undefined> {
  return checksumForMediaFileShared(fileName, mediaDir);
}

export type HomepageSeedMediaFileInspection = {
  orphanFileNames: string[];
  modifiedFileNames: string[];
};

export async function inspectHomepageSeedMediaFiles(
  referencedFileNames: ReadonlySet<string>,
  mediaDir = backendMediaDir,
): Promise<HomepageSeedMediaFileInspection> {
  return inspectSeedMediaFiles(
    referencedFileNames,
    mediaDir,
    HOMEPAGE_SEED_NAMESPACE,
    homepageSeedAssets,
    homepageSeedUploadName,
  );
}

export async function cleanupHomepageSeedMediaFiles(
  referencedFileNames: ReadonlySet<string>,
  mediaDir = backendMediaDir,
): Promise<HomepageSeedMediaFileInspection> {
  return cleanupSeedMediaFiles(
    referencedFileNames,
    mediaDir,
    HOMEPAGE_SEED_NAMESPACE,
    homepageSeedAssets,
    homepageSeedUploadName,
  );
}

import { fileURLToPath } from 'node:url';

import {
  assetKeyForSeedFileName as assetKeyForSeedFileNameShared,
  checksumMatchesSeedFileName as checksumMatchesSeedFileNameShared,
  cleanupSeedMediaFiles,
  inspectSeedMediaFiles,
  loadSeedAsset,
  seedUploadName,
  toPayloadFile,
  type LoadedSeedAsset,
} from '../shared/seed-assets';
import { backendMediaDir } from '../shared/media-paths';
import {
  communitySeedAssets,
  type CommunitySeedAssetKey,
} from '../../../seed/communities/manifest';

export const COMMUNITY_SEED_NAMESPACE = 'communities';

export const communitySeedAssetsDir = fileURLToPath(
  new URL('../../../seed/communities/assets/', import.meta.url),
);

export type LoadedCommunitySeedAsset = LoadedSeedAsset<CommunitySeedAssetKey>;

export { toPayloadFile };

export function communitySeedUploadName(key: CommunitySeedAssetKey): string {
  const asset = communitySeedAssets[key];
  return seedUploadName(COMMUNITY_SEED_NAMESPACE, key, asset.sha256, asset.fileName);
}

export async function loadCommunitySeedAsset(
  key: CommunitySeedAssetKey,
): Promise<LoadedCommunitySeedAsset> {
  return loadSeedAsset(
    communitySeedAssetsDir,
    COMMUNITY_SEED_NAMESPACE,
    key,
    communitySeedAssets[key],
  );
}

export function assetKeyForCommunitySeedFileName(
  fileName: string,
): CommunitySeedAssetKey | undefined {
  return assetKeyForSeedFileNameShared(
    fileName,
    COMMUNITY_SEED_NAMESPACE,
    communitySeedAssets,
    communitySeedUploadName,
  );
}

export function checksumMatchesCommunitySeedFileName(fileName: string, checksum: string): boolean {
  if (checksumMatchesSeedFileNameShared(fileName, checksum)) return true;
  const key = assetKeyForCommunitySeedFileName(fileName);
  return key ? checksum === communitySeedAssets[key].sha256 : false;
}

export async function cleanupCommunitySeedMediaFiles(
  referencedFileNames: ReadonlySet<string>,
  mediaDir = backendMediaDir,
) {
  return cleanupSeedMediaFiles(
    referencedFileNames,
    mediaDir,
    COMMUNITY_SEED_NAMESPACE,
    communitySeedAssets,
    communitySeedUploadName,
  );
}

export async function inspectCommunitySeedMediaFiles(
  referencedFileNames: ReadonlySet<string>,
  mediaDir = backendMediaDir,
) {
  return inspectSeedMediaFiles(
    referencedFileNames,
    mediaDir,
    COMMUNITY_SEED_NAMESPACE,
    communitySeedAssets,
    communitySeedUploadName,
  );
}

import { cleanupHomepageSeedMediaFiles } from './homepage-seed/assets';

if (!process.argv.includes('after-database-reset')) {
  throw new Error('This cleanup may run only after the local database volume has been removed.');
}

const result = await cleanupHomepageSeedMediaFiles(new Set());

process.stdout.write(
  `Removed ${result.orphanFileNames.length} recognized homepage seed media file(s); preserved ${result.modifiedFileNames.length} modified file(s).\n`,
);

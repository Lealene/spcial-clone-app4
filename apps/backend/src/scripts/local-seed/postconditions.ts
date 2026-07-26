import { CMS_PAGE_BLOCK_TYPES } from '@mvp-realty/api-contracts';
import type { Payload } from 'payload';

import { buildHomepageSeedData } from '../seed-homepage';
import { findHomepageSeedMedia, inspectHomepageMediaOrphans } from '../homepage-seed/media';
import { seedDataDifferencePaths, seedDataMatches } from '../homepage-seed/normalize';

function assertSeed(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export type LocalSeedVerification = {
  canonicalMedia: number;
  blocks: number;
  pages: number;
};

export async function verifyLocalSeedPostconditions(
  payload: Payload,
): Promise<LocalSeedVerification> {
  const mediaDocs = await findHomepageSeedMedia(payload);
  const { header, footer, pageData } = buildHomepageSeedData(mediaDocs);
  const [currentHeader, currentFooter, pages, publicPages, orphanInspection] = await Promise.all([
    payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: true }),
    payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      depth: 0,
      limit: 2,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      depth: 0,
      limit: 2,
      overrideAccess: false,
    }),
    inspectHomepageMediaOrphans(payload),
  ]);

  assertSeed(
    seedDataMatches(currentHeader, header),
    `Header seed verification failed at: ${seedDataDifferencePaths(currentHeader, header).join(', ')}.`,
  );
  assertSeed(
    seedDataMatches(currentFooter, footer),
    `Footer seed verification failed at: ${seedDataDifferencePaths(currentFooter, footer).join(', ')}.`,
  );
  assertSeed(pages.totalDocs === 1, `Expected one seeded home page; found ${pages.totalDocs}.`);
  assertSeed(publicPages.totalDocs === 1, 'The seeded home page is not publicly readable.');

  const page = pages.docs[0];
  assertSeed(page, 'The seeded home page is missing.');
  assertSeed(page._status === 'published', 'The seeded home page is not published.');
  assertSeed(
    seedDataMatches(page, pageData),
    `Home page seed verification failed at: ${seedDataDifferencePaths(page, pageData).join(', ')}.`,
  );

  const blockTypes = page.layout.map((block) => block.blockType);
  assertSeed(
    JSON.stringify(blockTypes) === JSON.stringify(CMS_PAGE_BLOCK_TYPES),
    `Expected canonical block order ${CMS_PAGE_BLOCK_TYPES.join(', ')}; found ${blockTypes.join(', ')}.`,
  );
  assertSeed(
    orphanInspection.orphanFileNames.length === 0,
    `Found unreferenced seed media files: ${orphanInspection.orphanFileNames.join(', ')}.`,
  );
  return {
    canonicalMedia: Object.keys(mediaDocs).length,
    blocks: blockTypes.length,
    pages: pages.totalDocs,
  };
}

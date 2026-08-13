import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { CMS_PAGE_BLOCK_TYPES } from '@mvp-realty/api-contracts';
import { afterEach, describe, expect, it } from 'vitest';

import type { Footer, Header } from '@/payload-types';

import {
  assetKeyForSeedFileName,
  cleanupHomepageSeedMediaFiles,
  homepageSeedAssetsDir,
  homepageSeedUploadName,
} from './assets';
import { footerIsUnseeded, headerIsUnseeded } from './fresh';
import type { HomepageSeedMediaDocs } from './media';
import { seedDataDifferencePaths, seedDataMatches } from './normalize';
import { homepageSeedAssets } from '../../../seed/homepage/manifest';
import { buildHomepageSeedData } from './seed';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

async function temporaryMediaDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'mvp-homepage-seed-'));
  temporaryDirectories.push(directory);
  return directory;
}

describe('homepage seed normalization', () => {
  it('ignores Payload metadata and fields outside the managed seed shape', () => {
    const desired = {
      title: 'Home',
      layout: [{ blockType: 'hero', heading: 'Welcome' }],
    };
    const current = {
      id: 1,
      title: 'Home',
      createdAt: 'yesterday',
      extra: 'Payload default',
      layout: [{ id: 'generated', blockType: 'hero', heading: 'Welcome', extra: true }],
    };

    expect(seedDataMatches(current, desired)).toBe(true);
    expect(seedDataDifferencePaths(current, desired)).toEqual([]);
  });

  it('detects extra managed array entries', () => {
    const desired = { navItems: [{ label: 'The Life' }] };
    const current = { navItems: [{ label: 'The Life' }, { label: 'Extra link' }] };

    expect(seedDataMatches(current, desired)).toBe(false);
    expect(seedDataDifferencePaths(current, desired)).toEqual(['navItems']);
  });

  it('reports only managed editorial differences', () => {
    const desired = { title: 'Home', layout: [{ heading: 'Expected' }] };
    const current = { title: 'Homepage', layout: [{ heading: 'Changed' }] };

    expect(seedDataMatches(current, desired)).toBe(false);
    expect(seedDataDifferencePaths(current, desired)).toEqual(['layout[0].heading', 'title']);
  });
});

describe('fresh Payload globals', () => {
  it('accepts Payload Header defaults as unseeded', () => {
    const header = {
      brandHomeLink: { type: 'custom' },
      brandLabel: '55 Living Team',
      navItems: [],
      primaryCta: { link: { type: 'custom' } },
      mobileMenuLabel: 'Menu',
      mobileMenuCloseLabel: 'Close menu',
    } as unknown as Header;

    expect(headerIsUnseeded(header)).toBe(true);
    expect(
      headerIsUnseeded({ ...header, navItems: [{ label: 'Edited' }] } as unknown as Header),
    ).toBe(false);
    expect(headerIsUnseeded({ ...header, brandLogo: { image: 12 } } as unknown as Header)).toBe(
      false,
    );
  });

  it('accepts an empty Footer as unseeded', () => {
    expect(footerIsUnseeded({ columns: [], bottomRightLinks: [] } as unknown as Footer)).toBe(true);
    expect(footerIsUnseeded({ brandName: 'Edited' } as unknown as Footer)).toBe(false);
    expect(
      footerIsUnseeded({
        columns: [],
        bottomRightLinks: [],
        brandLogo: { image: 12 },
      } as unknown as Footer),
    ).toBe(false);
  });
});

describe('canonical local CMS seed inventory', () => {
  it('covers every registered block and canonical media asset', () => {
    const mediaDocs = Object.fromEntries(
      Object.entries(homepageSeedAssets).map(([key, asset], index) => [
        key,
        {
          id: index + 1,
          alt: asset.alt,
          filename: asset.fileName,
          url: `/media/${asset.fileName}`,
        },
      ]),
    ) as HomepageSeedMediaDocs;
    const { header, footer, pageData } = buildHomepageSeedData(mediaDocs);
    const serializedPage = JSON.stringify(pageData);

    expect(pageData._status).toBe('published');
    expect(pageData.layout.map((block) => block.blockType)).toEqual(CMS_PAGE_BLOCK_TYPES);
    expect(header.navItems).toHaveLength(4);
    expect(footer.columns).toHaveLength(3);
    Object.values(mediaDocs).forEach((media) => {
      expect(serializedPage).toContain(`"image":${String(media.id)}`);
    });
  });
});

describe('homepage seed media cleanup', () => {
  it('recognizes deterministic and legacy Payload filenames', () => {
    expect(assetKeyForSeedFileName(homepageSeedUploadName('hero'))).toBe('hero');
    expect(homepageSeedUploadName('hero')).toMatch(/^seed-homepage--hero--[a-f0-9]{12}\.jpg$/);
    expect(assetKeyForSeedFileName('hero-naples-waterfront-2.jpg')).toBe('hero');
    expect(assetKeyForSeedFileName('editor-upload.jpg')).toBeUndefined();
  });

  it('removes only unreferenced checksum-matching seed files', async () => {
    const mediaDir = await temporaryMediaDirectory();
    const hero = await readFile(path.join(homepageSeedAssetsDir, 'hero-naples-waterfront.jpg'));
    const referencedName = 'hero-naples-waterfront-1.jpg';
    const orphanName = 'hero-naples-waterfront.jpg';
    const modifiedName = 'hero-naples-waterfront-2.jpg';
    const unrelatedName = 'editor-upload.jpg';

    await Promise.all([
      writeFile(path.join(mediaDir, referencedName), hero),
      writeFile(path.join(mediaDir, orphanName), hero),
      writeFile(path.join(mediaDir, modifiedName), 'changed'),
      writeFile(path.join(mediaDir, unrelatedName), hero),
    ]);

    const result = await cleanupHomepageSeedMediaFiles(new Set([referencedName]), mediaDir);
    const remaining = await readdir(mediaDir);

    expect(result.orphanFileNames).toEqual([orphanName]);
    expect(result.modifiedFileNames).toEqual([modifiedName]);
    expect(remaining.sort()).toEqual([modifiedName, referencedName, unrelatedName].sort());
  });
});

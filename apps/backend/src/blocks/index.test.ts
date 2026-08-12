import {
  CMS_PAGE_BLOCK_LIMITS,
  CMS_PAGE_BLOCK_TYPES,
  type CmsPageBlockType,
} from '@mvp-realty/api-contracts';
import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { Pages } from '../collections/Pages';
import { pageBlocks, pageBlocksByType } from './index';

function namedField(fields: Field[], name: string): Field | undefined {
  return fields.find((field) => 'name' in field && field.name === name);
}

describe('Payload page block catalog', () => {
  it('matches the canonical block catalog, slugs, and order', () => {
    expect(Object.keys(pageBlocksByType)).toEqual([...CMS_PAGE_BLOCK_TYPES]);
    expect(pageBlocks.map((block) => block.slug)).toEqual([...CMS_PAGE_BLOCK_TYPES]);
    expect(new Set(pageBlocks.map((block) => block.slug)).size).toBe(pageBlocks.length);

    CMS_PAGE_BLOCK_TYPES.forEach((blockType) => {
      expect(pageBlocksByType[blockType].slug).toBe(blockType);
      expect(pageBlocksByType[blockType].interfaceName).toBeTruthy();
    });
  });

  it('gives every block one enabled field first with a true default', () => {
    pageBlocks.forEach((block) => {
      const enabledFields = block.fields.filter(
        (field) => 'name' in field && field.name === 'enabled',
      );
      expect(enabledFields).toHaveLength(1);
      expect(block.fields[0]).toMatchObject({
        name: 'enabled',
        type: 'checkbox',
        defaultValue: true,
      });
    });
  });

  it('bounds repeatable authoring arrays and keeps the mandatory ones required', () => {
    const expectations: Array<{
      blockType: CmsPageBlockType;
      fieldName: string;
      limits: { min: number; max: number };
      required: boolean;
    }> = [
      {
        blockType: 'communitiesStrip',
        fieldName: 'items',
        limits: CMS_PAGE_BLOCK_LIMITS.communitiesStripItems,
        required: false,
      },
      {
        blockType: 'featuredCommunities',
        fieldName: 'manualCommunities',
        limits: CMS_PAGE_BLOCK_LIMITS.featuredCommunities,
        required: false,
      },
      // featuredResidences.manualListings is intentionally absent: it is deprecated
      // and optional, asserted separately below.
      {
        blockType: 'lifestyle',
        fieldName: 'tiles',
        limits: CMS_PAGE_BLOCK_LIMITS.lifestyleTiles,
        required: true,
      },
      {
        blockType: 'testimonials',
        fieldName: 'stories',
        limits: CMS_PAGE_BLOCK_LIMITS.testimonialStories,
        required: true,
      },
      {
        blockType: 'amenities',
        fieldName: 'amenities',
        limits: CMS_PAGE_BLOCK_LIMITS.amenities,
        required: true,
      },
      // Credential stats are optional decoration; an owner intro saves with zero rows.
      {
        blockType: 'ownerIntro',
        fieldName: 'credentials',
        limits: CMS_PAGE_BLOCK_LIMITS.ownerCredentials,
        required: false,
      },
    ];

    expectations.forEach(({ blockType, fieldName, limits, required }) => {
      expect(namedField(pageBlocksByType[blockType].fields, fieldName)).toMatchObject({
        type: 'array',
        required,
        minRows: limits.min,
        maxRows: limits.max,
      });
    });
  });

  /**
   * The rail renders listings flagged `isFeatured`, so forcing editors to fill rows
   * that are never displayed was a trap. Guards against it being made required again
   * before the drop migration removes the field.
   */
  it('leaves the deprecated featuredResidences manual rows optional and hidden', () => {
    expect(namedField(pageBlocksByType.featuredResidences.fields, 'manualListings')).toMatchObject({
      type: 'array',
      admin: { hidden: true },
    });
    expect(
      namedField(pageBlocksByType.featuredResidences.fields, 'manualListings'),
    ).not.toHaveProperty('required', true);
  });

  it('requires whole-number visible item limits', () => {
    expect(namedField(pageBlocksByType.communitiesStrip.fields, 'maxItems')).toMatchObject({
      validate: expect.any(Function),
    });
    expect(namedField(pageBlocksByType.lifestyle.fields, 'maxTiles')).toMatchObject({
      validate: expect.any(Function),
    });
  });

  it('registers the canonical blocks and limits on Pages.layout', () => {
    expect(namedField(Pages.fields, 'layout')).toMatchObject({
      type: 'blocks',
      blocks: pageBlocks,
      required: true,
      minRows: CMS_PAGE_BLOCK_LIMITS.layout.min,
      maxRows: CMS_PAGE_BLOCK_LIMITS.layout.max,
    });
  });
});

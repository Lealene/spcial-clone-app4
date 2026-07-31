import type { Metadata } from 'next';

import type { CmsPage } from '@mvp-realty/api-contracts';

import { buildEntityMetadata } from '@/lib/seo/metadata';

/**
 * Thin adapter kept for call-site readability. All the behaviour lives in
 * `buildEntityMetadata`, which listings and communities share.
 */
export function getCmsPageMetadata(page: CmsPage, path: string): Metadata {
  return buildEntityMetadata({
    seo: page.seo,
    path,
    title: page.title,
  });
}

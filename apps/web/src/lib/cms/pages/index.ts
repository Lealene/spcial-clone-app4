import type { CmsPage } from '@mvp-realty/api-contracts';

import { fetchJson } from '../client';
import { getFooterContent, getHeaderContent } from '../site-chrome';
import { normalizePage } from './page';
import { array, isRecord } from './primitives';

export { cmsPageBlockAdapters, normalizeCmsPageBlock } from './block-adapters';
export { normalizePage } from './page';
export { getFooterContent, getHeaderContent };

type PageContentOptions = {
  fallback?: CmsPage;
};

function pagePath(slug: string): string {
  const query = encodeURIComponent(slug);
  return `/api/pages?where[slug][equals]=${query}&depth=2&limit=1`;
}

export async function getPageContent(
  slug: string,
  options: PageContentOptions = {},
): Promise<CmsPage | null> {
  try {
    const response = await fetchJson(pagePath(slug));
    const docs = isRecord(response) ? array(response.docs) : [];
    const page = docs[0];
    if (!page) return options.fallback ?? null;

    const parsed = normalizePage(page);
    return parsed.layout.length > 0 ? parsed : (options.fallback ?? null);
  } catch {
    return options.fallback ?? null;
  }
}

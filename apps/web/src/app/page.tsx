import type { Metadata } from 'next';
import { cache } from 'react';

import { CmsPageBlocksRenderer } from '@/components/blocks';
import { getHomePageContent as resolveHomePageContent } from '@/lib/cms/pages/home';
import { getCmsPageMetadata } from '@/lib/cms/pages/metadata';
import { JsonLd } from '@/lib/seo/json-ld';
import { buildCmsPageGraph } from '@/lib/seo/web-page';

/**
 * Mixes CMS page blocks with featured listings, so it is purged by both the
 * per-page tag and `listings-featured`. This is the missed-webhook backstop.
 */
export const revalidate = 3600;

const getHomePageContent = cache(resolveHomePageContent);

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePageContent();
  return getCmsPageMetadata(page, '/');
}

export default async function HomePage() {
  const page = await getHomePageContent();
  return (
    <>
      <JsonLd nodes={buildCmsPageGraph(page, '/')} />
      <CmsPageBlocksRenderer blocks={page.layout} />
    </>
  );
}

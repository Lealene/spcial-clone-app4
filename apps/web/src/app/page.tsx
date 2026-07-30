import type { Metadata } from 'next';
import { cache } from 'react';

import { CmsPageBlocksRenderer } from '@/components/blocks';
import { CmsDataError } from '@/lib/cms/errors';
import { getPageContent } from '@/lib/cms/pages';
import { getCmsPageMetadata } from '@/lib/cms/pages/metadata';

/**
 * Mixes CMS page blocks with featured listings, so it is purged by both the
 * per-page tag and `listings-featured`. This is the missed-webhook backstop.
 */
export const revalidate = 3600;

const getHomePageContent = cache(async () => {
  const result = await getPageContent('home');
  if (result.status === 'missing') {
    throw new CmsDataError('The required CMS homepage is missing.', {
      kind: 'missing-required-content',
      resource: 'page:home',
    });
  }
  return result.page;
});

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePageContent();
  return getCmsPageMetadata(page, '/');
}

export default async function HomePage() {
  const page = await getHomePageContent();
  return <CmsPageBlocksRenderer blocks={page.layout} />;
}

import type { Metadata } from 'next';
import { cache } from 'react';

import { CmsPageBlocksRenderer } from '@/components/blocks';
import { CmsDataError } from '@/lib/cms/errors';
import { getPageContent } from '@/lib/cms/pages';
import { getCmsPageMetadata } from '@/lib/cms/pages/metadata';

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

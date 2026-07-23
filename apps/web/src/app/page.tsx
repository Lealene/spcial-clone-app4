import type { Metadata } from 'next';

import { CmsPageBlocksRenderer } from '@/components/blocks';
import { homepageFixture } from '@/data/homepage-fixture';
import { getPageContent } from '@/lib/cms/pages';
import { getCmsPageMetadata } from '@/lib/cms/pages/metadata';

async function getHomePageContent() {
  return (await getPageContent('home')) ?? homepageFixture;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePageContent();
  return getCmsPageMetadata(page, '/');
}

export default async function HomePage() {
  const page = await getHomePageContent();

  return <CmsPageBlocksRenderer blocks={page.layout} />;
}

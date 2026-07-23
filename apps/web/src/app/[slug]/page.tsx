import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CmsPageBlocksRenderer } from '@/components/blocks';
import { getPageContent } from '@/lib/cms/pages';
import { getCmsPageMetadata } from '@/lib/cms/pages/metadata';

const RESERVED_PAGE_SLUGS = new Set(['admin', 'api', 'listings', 'communities', 'ui']);

type Params = { slug: string };

function isReservedSlug(slug: string): boolean {
  return RESERVED_PAGE_SLUGS.has(slug);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedSlug(slug)) return { title: 'Page Not Found — MVP Realty' };

  const page = await getPageContent(slug);
  if (!page) return { title: 'Page Not Found — MVP Realty' };

  return getCmsPageMetadata(page, `/${slug}`);
}

export default async function CmsPageRoute({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (isReservedSlug(slug)) notFound();

  const page = await getPageContent(slug);
  if (!page) notFound();

  return <CmsPageBlocksRenderer blocks={page.layout} />;
}

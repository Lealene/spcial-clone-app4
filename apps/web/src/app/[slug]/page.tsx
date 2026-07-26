import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CmsPageBlocksRenderer } from '@/components/blocks';
import { getPageContent, type CmsPageContentResult } from '@/lib/cms/pages';
import { getCmsPageMetadata } from '@/lib/cms/pages/metadata';

const RESERVED_PAGE_SLUGS = new Set(['admin', 'api', 'listings', 'communities', 'ui']);

type Params = { slug: string };

function isReservedSlug(slug: string): boolean {
  return RESERVED_PAGE_SLUGS.has(slug);
}

function requireCmsPage(result: CmsPageContentResult) {
  if (result.status === 'missing') notFound();
  return result.page;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedSlug(slug)) return { title: 'Page Not Found — MVP Realty' };

  const result = await getPageContent(slug);
  if (result.status === 'missing') return { title: 'Page Not Found — MVP Realty' };
  return getCmsPageMetadata(result.page, `/${slug}`);
}

export default async function CmsPageRoute({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (isReservedSlug(slug)) notFound();

  const page = requireCmsPage(await getPageContent(slug));
  return <CmsPageBlocksRenderer blocks={page.layout} />;
}

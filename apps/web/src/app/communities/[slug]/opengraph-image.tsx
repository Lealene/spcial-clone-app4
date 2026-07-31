import { getCommunityDetailBySlug } from '@/lib/cms/areas';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, renderOgCard } from '@/lib/seo/og-card';

export const alt = 'Gated community in Southwest Florida';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [community, settings] = await Promise.all([
    getCommunityDetailBySlug(slug).catch((): null => null),
    getSiteSettings(),
  ]);

  if (!community) {
    return renderOgCard({ title: 'Community not found', brandName: settings.name });
  }

  const facts = community.facts.slice(0, 3).map((fact) => `${fact.value} ${fact.label}`);

  return renderOgCard({
    eyebrow: `${community.city}, Florida`,
    title: community.name,
    facts,
    imageUrl: community.gallery[0]?.src,
    brandName: settings.name,
  });
}

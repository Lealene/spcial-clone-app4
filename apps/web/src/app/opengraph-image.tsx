import { getSiteSettings } from '@/lib/cms/site-settings';
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, renderOgCard } from '@/lib/seo/og-card';

export const alt = 'MVP Realty — Gulf-Coast concierge for luxury gated communities';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

/** Site-wide fallback card. Any route without its own image inherits this one. */
export default async function Image() {
  const settings = await getSiteSettings();

  return renderOgCard({
    eyebrow: settings.areaServed[0] ?? 'Southwest Florida',
    title: settings.description ?? 'Luxury gated communities on the Gulf Coast',
    imageUrl: settings.defaultOgImage?.src,
    brandName: settings.name,
  });
}

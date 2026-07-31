import { getListingBySlug } from '@/lib/cms/listings';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { fmtPrice } from '@/lib/listings/filters';
import { listingPlaceLabel } from '@/lib/seo/listing';
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, renderOgCard } from '@/lib/seo/og-card';

export const alt = 'Residence for sale';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [listing, settings] = await Promise.all([
    getListingBySlug(slug).catch((): null => null),
    getSiteSettings(),
  ]);

  if (!listing) {
    return renderOgCard({ title: 'Residence not found', brandName: settings.name });
  }

  const facts = [
    listing.beds > 0 ? `${listing.beds} bed` : null,
    listing.baths > 0 ? `${listing.baths} bath` : null,
    listing.sqft > 0 ? `${listing.sqft.toLocaleString('en-US')} sq ft` : null,
  ].filter((fact): fact is string => fact !== null);

  return renderOgCard({
    eyebrow: listingPlaceLabel(listing).replace(', ', ' · '),
    title: listing.name,
    facts,
    highlight: fmtPrice(listing.price),
    imageUrl: listing.gallery[0]?.src,
    brandName: settings.name,
  });
}

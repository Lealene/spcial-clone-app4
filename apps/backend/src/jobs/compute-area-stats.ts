import type { Payload, RequestContext } from 'payload';

type ListingStatsRow = {
  price?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  pricePerSqft?: number | null;
  hoaMonthly?: number | null;
  yearBuilt?: number | null;
  features?: ('waterfront' | 'private-pool' | 'golf' | 'gated' | '55-plus')[] | null;
};

function minMax(values: number[]): { min?: number; max?: number } {
  if (values.length === 0) return {};
  return { min: Math.min(...values), max: Math.max(...values) };
}

export async function computeAndWriteAreaStats(
  payload: Payload,
  areaId: number | string,
  context?: RequestContext,
): Promise<void> {
  const result = await payload.find({
    collection: 'listings',
    where: {
      and: [{ area: { equals: areaId } }, { isActive: { equals: true } }],
    },
    limit: 1000,
    depth: 0,
    pagination: false,
  });

  const listings = result.docs as ListingStatsRow[];
  const prices = listings.map((l) => l.price).filter((n): n is number => typeof n === 'number');
  const beds = listings.map((l) => l.beds).filter((n): n is number => typeof n === 'number');
  const sqft = listings.map((l) => l.sqft).filter((n): n is number => typeof n === 'number');
  const pps = listings.map((l) => l.pricePerSqft).filter((n): n is number => typeof n === 'number');
  const hoa = listings.map((l) => l.hoaMonthly).filter((n): n is number => typeof n === 'number');
  const years = listings.map((l) => l.yearBuilt).filter((n): n is number => typeof n === 'number');

  const priceRange = minMax(prices);
  const bedsRange = minMax(beds);
  const sqftRange = minMax(sqft);
  const hoaRange = minMax(hoa);
  const yearRange = minMax(years);

  const avgPricePerSqft =
    pps.length > 0 ? Math.round(pps.reduce((sum, n) => sum + n, 0) / pps.length) : undefined;

  await payload.update({
    collection: 'areas',
    id: areaId,
    data: {
      activeCount: listings.length,
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      avgPricePerSqft,
      bedsMin: bedsRange.min,
      bedsMax: bedsRange.max,
      sqftMin: sqftRange.min,
      sqftMax: sqftRange.max,
      hoaMin: hoaRange.min,
      hoaMax: hoaRange.max,
      yearBuiltMin: yearRange.min,
      yearBuiltMax: yearRange.max,
      is55Plus: listings.some((l) => l.features?.includes('55-plus')),
      isGated: listings.some((l) => l.features?.includes('gated')),
    },
    overrideAccess: true,
    context,
  });
}

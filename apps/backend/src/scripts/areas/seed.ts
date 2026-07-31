import type { Payload, PayloadRequest } from 'payload';

type SeedReq = { req?: Pick<PayloadRequest, 'transactionID'> };

type AmenitySeed = {
  icon:
    | 'golf'
    | 'marina'
    | 'beach'
    | 'racquet'
    | 'fitness'
    | 'dining'
    | 'trails'
    | 'pool'
    | 'club'
    | 'spa'
    | 'gate'
    | 'dog';
  title: string;
};

type AreaSeed = {
  slug: string;
  name: string;
  kind: 'community' | 'city';
  city: string;
  county: string;
  mlsAreaMajor: string;
  syncEnabled: boolean;
  blurb?: string;
  locality?: string;
  priceRange?: string;
  totalResidences?: number;
  amenities?: AmenitySeed[];
};

/** Phase 1 seed set — Fort Myers city deferred. */
export const AREA_SEEDS: AreaSeed[] = [
  {
    slug: 'bonita-bay',
    name: 'Bonita Bay',
    kind: 'community',
    city: 'Bonita Springs',
    county: 'Lee',
    mlsAreaMajor: 'BONITA BAY',
    syncEnabled: true,
    blurb: 'Bonita Springs · golf, marina & a private Gulf beach park',
    locality: 'Bonita Springs · private Gulf beach park',
    priceRange: 'From the $400s – $5M+',
    totalResidences: 320,
    amenities: [
      { icon: 'golf', title: 'Golf & Marina' },
      { icon: 'gate', title: 'Gated' },
      { icon: 'beach', title: 'Beach Park' },
    ],
  },
  {
    slug: 'valencia-bonita',
    name: 'Valencia Bonita',
    kind: 'community',
    city: 'Bonita Springs',
    county: 'Lee',
    mlsAreaMajor: 'VALENCIA BONITA',
    syncEnabled: true,
    blurb: 'Bonita Springs · 55+ gated with a resort clubhouse',
    locality: 'Bonita Springs · 55+ gated',
    priceRange: 'From the $500s – $1M',
    totalResidences: 410,
    amenities: [
      { icon: 'gate', title: '55+ Gated' },
      { icon: 'club', title: 'Resort Clubhouse' },
      { icon: 'racquet', title: 'Tennis & Pickleball' },
    ],
  },
  {
    slug: 'valencia-trails',
    name: 'Valencia Trails',
    kind: 'community',
    city: 'Naples',
    county: 'Collier',
    mlsAreaMajor: 'VALENCIA TRAILS',
    syncEnabled: true,
    blurb: 'Naples · 55+ gated, resort pool minutes from the sand',
    locality: 'Naples · 55+ gated',
    priceRange: 'From the $600s – $1.3M',
    totalResidences: 275,
    amenities: [
      { icon: 'club', title: 'New & Resale' },
      { icon: 'gate', title: '55+ Gated' },
      { icon: 'pool', title: 'Resort Pool' },
    ],
  },
  {
    slug: 'bonita-springs',
    name: 'Bonita Springs',
    kind: 'city',
    city: 'Bonita Springs',
    county: 'Lee',
    mlsAreaMajor: 'BONITA SPRINGS',
    syncEnabled: true,
  },
  {
    slug: 'fort-myers-beach',
    name: 'Fort Myers Beach',
    kind: 'city',
    city: 'Fort Myers Beach',
    county: 'Lee',
    mlsAreaMajor: 'FORT MYERS BEACH',
    syncEnabled: true,
  },
];

function editorialData(seed: AreaSeed): Record<string, unknown> {
  if (seed.kind !== 'community') return {};

  return {
    blurb: seed.blurb,
    locality: seed.locality,
    priceRange: seed.priceRange,
    totalResidences: seed.totalResidences,
    amenities: seed.amenities,
  };
}

export async function seedAreas(
  payload: Payload,
  options: SeedReq = {},
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;
  const { req } = options;

  for (const seed of AREA_SEEDS) {
    const existing = await payload.find({
      collection: 'areas',
      where: { slug: { equals: seed.slug } },
      limit: 1,
      depth: 0,
      req,
    });

    const data = {
      name: seed.name,
      kind: seed.kind,
      city: seed.city,
      county: seed.county,
      mlsAreaMajor: seed.mlsAreaMajor,
      syncEnabled: seed.syncEnabled,
      ...editorialData(seed),
    };

    if (existing.docs[0]) {
      await payload.update({
        collection: 'areas',
        id: existing.docs[0].id,
        data,
        req,
      });
      updated += 1;
    } else {
      await payload.create({
        collection: 'areas',
        data: { slug: seed.slug, ...data },
        req,
      });
      created += 1;
    }
  }

  return { created, updated };
}

export type AreaGalleryMedia = {
  bonitaBay: { id: number };
  valenciaBonita: { id: number };
  valenciaTrails: { id: number };
};

/** Attach homepage community seed images to Area galleries (first image = card hero). */
export async function seedAreaGalleries(
  payload: Payload,
  media: AreaGalleryMedia,
): Promise<number> {
  const mapping: Array<{ slug: string; mediaId: number; alt: string }> = [
    {
      slug: 'bonita-bay',
      mediaId: media.bonitaBay.id,
      alt: "Bonita Bay's landmark stone entrance monument framed by oaks and flowering beds",
    },
    {
      slug: 'valencia-bonita',
      mediaId: media.valenciaBonita.id,
      alt: 'The 45,000-square-foot resort clubhouse at Valencia Bonita, framed by royal palms',
    },
    {
      slug: 'valencia-trails',
      mediaId: media.valenciaTrails.id,
      alt: 'Aerial of the resort-style beach-entry pool and clubhouse at Valencia Trails',
    },
  ];

  let updated = 0;
  for (const row of mapping) {
    const existing = await payload.find({
      collection: 'areas',
      where: { slug: { equals: row.slug } },
      limit: 1,
      depth: 0,
    });
    const doc = existing.docs[0];
    if (!doc) continue;

    await payload.update({
      collection: 'areas',
      id: doc.id,
      data: {
        gallery: [{ image: row.mediaId, alt: row.alt }],
      },
    });
    updated += 1;
  }

  return updated;
}

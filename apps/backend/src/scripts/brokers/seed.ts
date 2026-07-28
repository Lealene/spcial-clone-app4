import type { Payload, PayloadRequest } from 'payload';

type SeedReq = { req?: Pick<PayloadRequest, 'transactionID'> };

type BrokerCredential = { value: string; label: string };

type BrokerSeed = {
  slug: string;
  name: string;
  title: string;
  brokerage: string;
  conciergeLabel: string;
  phone: string;
  bio: string;
  signature: string;
  credentials: BrokerCredential[];
  rating: number;
  reviewCount: number;
  avgResponseMinutes: number;
};

export const BROKER_SEEDS: BrokerSeed[] = [
  {
    slug: 'eleanor-voss',
    name: 'Eleanor Voss',
    title: 'Broker & Owner',
    brokerage: 'MVP Realty',
    conciergeLabel: 'Your {community} Concierge',
    phone: '(239) 555-0148',
    bio: 'Eleanor has spent eighteen years matching Gulf-Coast buyers to the right gate, not just the right house. As the broker who owns the firm, she answers her own phone, walks the courts and clubhouses with you, and stays on long after the keys change hands. You are never handed off to a sales floor.',
    signature: 'Eleanor Voss',
    credentials: [
      { value: '18 yrs', label: 'on the Gulf Coast' },
      { value: '9', label: 'communities, known by name' },
      { value: '1:1', label: 'by appointment only' },
    ],
    rating: 5.0,
    reviewCount: 63,
    avgResponseMinutes: 3,
  },
];

const COMMUNITY_BROKER_SLUGS = ['bonita-bay', 'valencia-bonita', 'valencia-trails'] as const;

export async function seedBrokers(
  payload: Payload,
  options: SeedReq = {},
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;
  const { req } = options;

  for (const seed of BROKER_SEEDS) {
    const existing = await payload.find({
      collection: 'brokers',
      where: { slug: { equals: seed.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });

    const data = {
      name: seed.name,
      title: seed.title,
      brokerage: seed.brokerage,
      conciergeLabel: seed.conciergeLabel,
      phone: seed.phone,
      bio: seed.bio,
      signature: seed.signature,
      credentials: seed.credentials,
      rating: seed.rating,
      reviewCount: seed.reviewCount,
      avgResponseMinutes: seed.avgResponseMinutes,
    };

    if (existing.docs[0]) {
      await payload.update({
        collection: 'brokers',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
        req,
      });
      updated += 1;
    } else {
      await payload.create({
        collection: 'brokers',
        data: { slug: seed.slug, ...data },
        overrideAccess: true,
        req,
      });
      created += 1;
    }
  }

  return { created, updated };
}

/** Attach headshot media IDs supplied by the caller (never resolved inside). */
export async function attachBrokerHeadshot(
  payload: Payload,
  options: { headshotMediaId: number },
  seedReq: SeedReq = {},
): Promise<number> {
  let updated = 0;
  const { req } = seedReq;

  for (const seed of BROKER_SEEDS) {
    const existing = await payload.find({
      collection: 'brokers',
      where: { slug: { equals: seed.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const doc = existing.docs[0];
    if (!doc) continue;

    await payload.update({
      collection: 'brokers',
      id: doc.id,
      data: { headshot: options.headshotMediaId },
      overrideAccess: true,
      req,
    });
    updated += 1;
  }

  return updated;
}

/** Link the seeded Eleanor broker onto the three community Areas. */
export async function attachAreaBrokers(payload: Payload, options: SeedReq = {}): Promise<number> {
  const { req } = options;
  const broker = await payload.find({
    collection: 'brokers',
    where: { slug: { equals: 'eleanor-voss' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  });
  const brokerId = broker.docs[0]?.id;
  if (!brokerId) {
    payload.logger.warn({ msg: 'attachAreaBrokers skipped — eleanor-voss broker missing.' });
    return 0;
  }

  let updated = 0;
  for (const slug of COMMUNITY_BROKER_SLUGS) {
    const area = await payload.find({
      collection: 'areas',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const doc = area.docs[0];
    if (!doc) {
      payload.logger.warn({ msg: `attachAreaBrokers skipped missing area ${slug}.` });
      continue;
    }

    await payload.update({
      collection: 'areas',
      id: doc.id,
      data: { broker: brokerId },
      overrideAccess: true,
      req,
    });
    updated += 1;
  }

  return updated;
}

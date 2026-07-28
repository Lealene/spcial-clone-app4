import { getPayload } from 'payload';

import config from '@payload-config';

import { syncBridgeListings } from '../jobs/sync-bridge-listings';

const areaSlug = process.argv[2];
const full = process.argv.includes('--full');

const payload = await getPayload({ config });
const result = await syncBridgeListings(payload, {
  trigger: 'manual',
  areaSlug,
  full,
});

// Drain a batch of hero mirrors
await payload.jobs.run({ limit: 30 });

payload.logger.info({
  msg: 'Bridge sync script complete.',
  ...result,
  areaSlug: areaSlug ?? '(all)',
  full,
});

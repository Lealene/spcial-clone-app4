import { getPayload } from 'payload';

import config from '@payload-config';

import { syncBridgeListings } from '../jobs/sync-bridge-listings';

// `payload run` only forwards CLI args placed after a `--` separator, e.g.
// `pnpm bridge:sync -- --full bonita-bay`. Skip flags when reading the positional
// area slug, otherwise `--full` alone is mistaken for an area name.
const args = process.argv.slice(2);
const full = args.includes('--full');
const areaSlug = args.find((arg) => !arg.startsWith('--'));

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

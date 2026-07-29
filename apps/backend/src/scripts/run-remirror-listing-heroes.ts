import { getPayload } from 'payload';

import config from '@payload-config';

import { remirrorListingHeroes } from '../jobs/mirror-listing-hero';

const force = process.argv.includes('--force');

const payload = await getPayload({ config });
const result = await remirrorListingHeroes(payload, { force });

payload.logger.info({
  msg: 'Listing hero remirror complete.',
  ...result,
  force,
});

if (result.errors.length > 0) {
  throw new Error(
    `Hero remirror finished with ${result.errors.length} error(s). First: ${result.errors[0]}`,
  );
}

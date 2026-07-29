import { getPayload } from 'payload';

import config from '@payload-config';

import { verifyLocalSeedPostconditions } from './postconditions';
import { seedHomepage } from './seed';

const payload = await getPayload({ config });
const changes = await seedHomepage(payload);
const verified = await verifyLocalSeedPostconditions(payload);

payload.logger.info({
  msg: 'Local CMS seed complete and verified.',
  ...changes,
  ...verified,
});

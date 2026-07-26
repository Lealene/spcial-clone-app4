import type { Payload } from 'payload';

import { verifyLocalSeedPostconditions } from './local-seed/postconditions';
import { seedHomepage } from './seed-homepage';

export async function seedLocal(payload: Payload): Promise<void> {
  const changes = await seedHomepage(payload);
  const verified = await verifyLocalSeedPostconditions(payload);

  payload.logger.info({
    msg: 'Local CMS seed complete and verified.',
    ...changes,
    ...verified,
  });
}

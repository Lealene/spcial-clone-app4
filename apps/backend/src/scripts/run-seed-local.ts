import { getPayload } from 'payload';

import config from '@payload-config';

import { seedLocal } from './seed-local';

const payload = await getPayload({ config });
await seedLocal(payload);

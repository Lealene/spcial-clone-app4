import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { firstUserOrAuthenticated } from '../access/firstUserOrAuthenticated';

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: firstUserOrAuthenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
};

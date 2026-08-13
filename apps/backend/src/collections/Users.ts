import type { CollectionConfig } from 'payload';
import { formatAdminURL } from 'payload/shared';

import { authenticated } from '../access/authenticated';
import { firstUserOrAuthenticated } from '../access/firstUserOrAuthenticated';
import { PASSWORD_RESET_EXPIRATION_MS, renderPasswordResetEmail } from '../email/password-reset';
import { env } from '../env';

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
  auth: {
    forgotPassword: {
      expiration: PASSWORD_RESET_EXPIRATION_MS,
      generateEmailSubject: () => 'Reset your 55 Living Team admin password',
      generateEmailHTML: (args) => {
        // Read the routes from config rather than hardcoding `/admin/reset` so a
        // customised admin route or Next basePath cannot silently break the link.
        const config = args?.req?.payload.config;
        const resetPath = `${config?.admin.routes.reset ?? '/reset'}/${args?.token ?? ''}`;

        return renderPasswordResetEmail({
          resetUrl: formatAdminURL({
            adminRoute: config?.routes.admin,
            path: resetPath as `/${string}`,
            serverURL: config?.serverURL ?? env.PAYLOAD_PUBLIC_SERVER_URL,
          }),
        });
      },
    },
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
};

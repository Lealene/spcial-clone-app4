import type { Access } from 'payload';

export const firstUserOrAuthenticated: Access = async ({ req }) => {
  if (req.user) return true;

  const result = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
  });

  return result.totalDocs === 0;
};

import type { FieldAccess } from 'payload';

export const authenticatedFieldRead: FieldAccess = ({ req }) => Boolean(req.user);

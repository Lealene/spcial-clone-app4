import { fileURLToPath } from 'node:url';

/** Local Payload media directory (`apps/backend/media`). */
export const backendMediaDir = fileURLToPath(new URL('../../../media/', import.meta.url));

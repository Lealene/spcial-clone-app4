import { CMS_TEXT_LIMITS, cmsAnchorIdSchema } from '@mvp-realty/api-contracts';
import type { Field } from 'payload';

export function anchorIdField(defaultValue?: string): Field {
  return {
    name: 'anchorId',
    type: 'text',
    defaultValue,
    maxLength: CMS_TEXT_LIMITS.anchorId,
    validate: (value: unknown) => {
      if (value === undefined || value === null || value === '') return true;
      return cmsAnchorIdSchema.safeParse(value).success
        ? true
        : 'Use a plain section ID beginning with a letter and containing only letters, numbers, _ or -.';
    },
    admin: {
      description: 'Plain section ID without #, for example featured-listings.',
    },
  };
}

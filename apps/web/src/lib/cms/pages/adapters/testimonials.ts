import type { TestimonialsBlock } from '@mvp-realty/api-contracts';

import { normalizeMediaField } from '../../media';
import { bool, mapValidRows, text } from '../primitives';

export function normalizeTestimonialsBlock(raw: Record<string, unknown>): TestimonialsBlock {
  return {
    blockType: 'testimonials',
    anchorId: text(raw.anchorId, 'testimonials'),
    kicker: text(raw.kicker),
    heading: text(raw.heading),
    headingAccent: text(raw.headingAccent) || undefined,
    headingSuffix: text(raw.headingSuffix) || undefined,
    stories: mapValidRows(raw.stories, (row) => {
      const slug = text(row.slug);
      const name = text(row.name);
      const location = text(row.location);
      const quote = text(row.quote);
      if (!slug || !name || !location || !quote) return null;

      return {
        slug,
        name,
        location,
        quote,
        portrait: normalizeMediaField(row.portrait, name),
        tabAriaLabel: text(row.tabAriaLabel) || undefined,
      };
    }),
    carouselAutoPlay: bool(raw.carouselAutoPlay, true),
    carouselIntervalMs:
      raw.carouselIntervalMs === undefined
        ? 6500
        : typeof raw.carouselIntervalMs === 'number'
          ? raw.carouselIntervalMs
          : Number.NaN,
    previousLabel: text(raw.previousLabel, 'Previous story'),
    nextLabel: text(raw.nextLabel, 'Next story'),
    tabListLabel: text(raw.tabListLabel, 'Choose a resident story'),
    counterSeparator: text(raw.counterSeparator, '/'),
    emptyStateHeading: text(raw.emptyStateHeading) || undefined,
    emptyStateBody: text(raw.emptyStateBody) || undefined,
  };
}

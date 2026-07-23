import type { TestimonialsBlock } from '@mvp-realty/api-contracts';

import { normalizeMediaField } from '../../media';
import { array, isRecord, num, text, bool } from '../primitives';

export function normalizeTestimonialsBlock(raw: Record<string, unknown>): TestimonialsBlock {
  return {
    blockType: 'testimonials',
    anchorId: text(raw.anchorId, 'testimonials'),
    kicker: text(raw.kicker, 'In Their Words'),
    heading: text(raw.heading, 'The address impressed them. The'),
    headingAccent: text(raw.headingAccent) || undefined,
    headingSuffix: text(raw.headingSuffix) || undefined,
    stories: array(raw.stories).map((item) => {
      const row = isRecord(item) ? item : {};
      return {
        slug: text(row.slug, text(row.name, 'story')),
        name: text(row.name, 'Resident'),
        location: text(row.location, 'MVP Realty client'),
        quote: text(row.quote, 'MVP Realty helped us find the right Gulf-Coast fit.'),
        portrait: normalizeMediaField(row.portrait, text(row.name, 'Resident portrait')),
        tabAriaLabel: text(row.tabAriaLabel) || undefined,
      };
    }),
    carouselAutoPlay: bool(raw.carouselAutoPlay, true),
    carouselIntervalMs: num(raw.carouselIntervalMs, 6500),
    previousLabel: text(raw.previousLabel, 'Previous story'),
    nextLabel: text(raw.nextLabel, 'Next story'),
    tabListLabel: text(raw.tabListLabel, 'Choose a resident story'),
    counterSeparator: text(raw.counterSeparator, '/'),
    emptyStateHeading: text(raw.emptyStateHeading) || undefined,
    emptyStateBody: text(raw.emptyStateBody) || undefined,
  };
}

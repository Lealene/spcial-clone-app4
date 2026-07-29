import { LEAD_SOURCES } from '@mvp-realty/api-contracts';
import { describe, expect, it } from 'vitest';

import type { Lead } from '../../payload-types';
import { buildLeadCaptureEmail } from './lead-email';

const baseLead = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Ellison',
  email: 'jane@example.com',
  formType: 'shortlist',
  surface: 'concierge-cta',
  crm: { status: 'pending' },
  updatedAt: '2026-07-29T00:00:00.000Z',
  createdAt: '2026-07-29T00:00:00.000Z',
} as unknown as Lead;

const lead = (overrides: Partial<Lead> = {}): Lead => ({ ...baseLead, ...overrides }) as Lead;

/** Read one parsed label back out of the email body. */
const labelValue = (text: string, label: string): string | undefined =>
  text
    .split('\n')
    .find((line) => line.startsWith(`${label}: `))
    ?.slice(label.length + 2);

describe('buildLeadCaptureEmail', () => {
  it('emits the labels Wise Agent parses for a minimal lead', () => {
    const { text } = buildLeadCaptureEmail(lead());

    expect(labelValue(text, 'Source Name')).toBe(LEAD_SOURCES.shortlist);
    expect(labelValue(text, 'First Name')).toBe('Jane');
    expect(labelValue(text, 'Last Name')).toBe('Ellison');
    expect(labelValue(text, 'Email Address')).toBe('jane@example.com');
  });

  it('derives Source Name from formType so a form cannot reroute itself', () => {
    expect(labelValue(buildLeadCaptureEmail(lead({ formType: 'tour' })).text, 'Source Name')).toBe(
      LEAD_SOURCES.tour,
    );
    expect(
      labelValue(buildLeadCaptureEmail(lead({ formType: 'shortlist' })).text, 'Source Name'),
    ).toBe(LEAD_SOURCES.shortlist);
  });

  it('omits the Phone label entirely when no phone was given', () => {
    expect(labelValue(buildLeadCaptureEmail(lead({ phone: '(239) 555-0148' })).text, 'Phone')).toBe(
      '(239) 555-0148',
    );
    expect(buildLeadCaptureEmail(lead()).text).not.toContain('Phone:');
  });

  it('carries listing, community, page, and surface context in Extra Details', () => {
    const { text } = buildLeadCaptureEmail(
      lead({
        formType: 'tour',
        surface: 'community-tour-band',
        pageUrl: 'https://mvprealty.com/communities/bonita-bay',
        area: { id: 3, name: 'Bonita Bay' } as never,
        listing: { id: 7, fullAddress: '4821 Bonita Bay Blvd', mlsId: '224001234' } as never,
      }),
    );

    const extra = labelValue(text, 'Extra Details') ?? '';
    expect(extra).toContain('Listing: 4821 Bonita Bay Blvd');
    expect(extra).toContain('MLS: 224001234');
    expect(extra).toContain('Community: Bonita Bay');
    expect(extra).toContain('Page: https://mvprealty.com/communities/bonita-bay');
    expect(extra).toContain('Submitted from: community-tour-band');
  });

  it('ignores an unpopulated relationship instead of sending an id', () => {
    const extra = labelValue(
      buildLeadCaptureEmail(lead({ listing: 7, area: 3 })).text,
      'Extra Details',
    );

    expect(extra).not.toContain('Listing:');
    expect(extra).not.toContain('Community:');
    expect(extra).toContain('Submitted from: concierge-cta');
  });

  it('keeps every parsed label on one line but preserves the verbatim message', () => {
    const message = 'A 3-bed near the marina.\n\nIdeally this winter.';
    const { text } = buildLeadCaptureEmail(lead({ message }));

    // The parser reads labels line by line, so a newline inside a value would
    // truncate it.
    expect(labelValue(text, 'Extra Details')).toBe(
      'A 3-bed near the marina. Ideally this winter. | Submitted from: concierge-cta',
    );
    expect(text).toContain('--- Message ---');
    expect(text).toContain(message);
  });

  it('names the source and the lead in the subject', () => {
    const { subject } = buildLeadCaptureEmail(lead({ formType: 'tour' }));

    expect(subject).toBe(`New website lead: ${LEAD_SOURCES.tour} — Jane Ellison`);
  });
});

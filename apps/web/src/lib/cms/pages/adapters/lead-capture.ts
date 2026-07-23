import type { LeadCaptureBlock } from '@mvp-realty/api-contracts';

import { normalizeLink } from '../../links';
import { isRecord, normalizeFormField, text } from '../primitives';

export function normalizeLeadCaptureBlock(raw: Record<string, unknown>): LeadCaptureBlock {
  return {
    blockType: 'leadCapture',
    anchorId: text(raw.anchorId, 'lead'),
    kicker: text(raw.kicker, 'Your Private Introduction'),
    heading: text(raw.heading, 'Let a concierge prepare your shortlist.'),
    body: text(
      raw.body,
      'Tell us a little about the life you are looking for, and your concierge will return with a curated set of residences.',
    ),
    helperNote: {
      icon: 'waves',
      beforeLinkText: text(isRecord(raw.helperNote) ? raw.helperNote.beforeLinkText : undefined),
      link: normalizeLink(
        isRecord(raw.helperNote) ? raw.helperNote.link : undefined,
        'by request',
        '#lead',
      ),
      afterLinkText: text(isRecord(raw.helperNote) ? raw.helperNote.afterLinkText : undefined),
    },
    fields: {
      name: normalizeFormField(
        isRecord(raw.fields) ? raw.fields.name : undefined,
        'Your name',
        'Jane & Robert Ellison',
        true,
      ),
      email: normalizeFormField(
        isRecord(raw.fields) ? raw.fields.email : undefined,
        'Email address',
        'you@example.com',
        true,
      ),
      phone: normalizeFormField(
        isRecord(raw.fields) ? raw.fields.phone : undefined,
        'Phone (optional)',
        '(239) 555-0148',
        false,
      ),
    },
    submitLabel: text(raw.submitLabel, 'Request My Shortlist'),
    privacyText: text(
      raw.privacyText,
      'A private introduction to MVP Realty. We never share your details.',
    ),
    successHeading: text(raw.successHeading, 'Your request is in.'),
    successBody: text(
      raw.successBody,
      'Thank you. Your concierge will be in touch shortly with a shortlist prepared just for you.',
    ),
    errorRequiredMessage: text(
      raw.errorRequiredMessage,
      'Please share your name and email so your concierge can reach you.',
    ),
    errorInvalidEmailMessage: text(
      raw.errorInvalidEmailMessage,
      'That email address looks incomplete.',
    ),
  };
}

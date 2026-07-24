import type { LeadCaptureBlock } from '@mvp-realty/api-contracts';

import { normalizeLink } from '../../links';
import { isRecord, normalizeFormField, text } from '../primitives';

export function normalizeLeadCaptureBlock(raw: Record<string, unknown>): LeadCaptureBlock {
  const helperNote = isRecord(raw.helperNote) ? raw.helperNote : {};
  const fields = isRecord(raw.fields) ? raw.fields : {};

  return {
    blockType: 'leadCapture',
    anchorId: text(raw.anchorId, 'lead'),
    kicker: text(raw.kicker),
    heading: text(raw.heading),
    body: text(raw.body),
    helperNote: {
      icon: 'waves',
      beforeLinkText: text(helperNote.beforeLinkText),
      link: normalizeLink(helperNote.link),
      afterLinkText: text(helperNote.afterLinkText),
    },
    fields: {
      name: normalizeFormField(fields.name, true),
      email: normalizeFormField(fields.email, true),
      phone: normalizeFormField(fields.phone, false),
    },
    submitLabel: text(raw.submitLabel),
    privacyText: text(raw.privacyText),
    successHeading: text(raw.successHeading),
    successBody: text(raw.successBody),
    errorRequiredMessage: text(raw.errorRequiredMessage),
    errorInvalidEmailMessage: text(raw.errorInvalidEmailMessage),
  };
}

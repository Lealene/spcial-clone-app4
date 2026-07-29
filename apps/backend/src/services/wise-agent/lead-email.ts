import { LEAD_SOURCES } from '@mvp-realty/api-contracts';

import type { Area, Lead, Listing } from '../../payload-types';

/**
 * Labels Wise Agent's email parser recognises, in the order their integration
 * guides document them. Only labels with a value are emitted — an empty label
 * carries no information and just adds noise to the contact's Activity entry.
 *
 * `Phone` is the label used here. If phone numbers do not land on the contact,
 * `Phone Number` is the documented alternative; changing it is a one-line edit.
 */
type LeadEmailLabel =
  | 'Source Name'
  | 'First Name'
  | 'Last Name'
  | 'Email Address'
  | 'Phone'
  | 'Extra Details';

/** Relationships arrive as an id when undepopulated; only objects carry fields. */
function populated<T extends object>(value: number | T | null | undefined): T | null {
  return value && typeof value === 'object' ? value : null;
}

/** Parsed values must stay on one line, so collapse any authored newlines. */
function singleLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export type LeadCaptureEmail = {
  subject: string;
  text: string;
};

/**
 * Payload lead → the email Wise Agent's lead-capture address parses.
 *
 * Wise Agent's `webconnect` API authenticates only via OAuth, so leads reach the
 * CRM as parseable email instead. This is one-way: no ClientID comes back, and
 * delivery to the mail provider is the strongest signal we get.
 *
 * `Source Name` is derived from `formType`, never taken from client input — it
 * drives lead rules in the CRM, so a spoofable value would let a form reroute
 * itself.
 *
 * Everything after the labelled block is ignored by the parser but still stored
 * on the contact's Activity, which is where the verbatim message goes so a
 * collapsed single-line copy is not the only record of what the lead wrote.
 */
export function buildLeadCaptureEmail(lead: Lead): LeadCaptureEmail {
  const area = populated<Area>(lead.area);
  const listing = populated<Listing>(lead.listing);
  const source = LEAD_SOURCES[lead.formType];

  const context: string[] = [];
  if (lead.message) context.push(singleLine(lead.message));
  if (listing?.fullAddress) context.push(`Listing: ${listing.fullAddress}`);
  if (listing?.mlsId) context.push(`MLS: ${listing.mlsId}`);
  if (area?.name) context.push(`Community: ${area.name}`);
  if (lead.pageUrl) context.push(`Page: ${lead.pageUrl}`);
  context.push(`Submitted from: ${lead.surface}`);

  const fields: Partial<Record<LeadEmailLabel, string>> = {
    'Source Name': source,
    'First Name': lead.firstName,
    'Last Name': lead.lastName,
    'Email Address': lead.email,
    ...(lead.phone ? { Phone: singleLine(lead.phone) } : {}),
    'Extra Details': context.join(' | '),
  };

  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([label, value]) => `${label}: ${value}`);

  if (lead.message) {
    lines.push('', '--- Message ---', lead.message.trim());
  }

  return {
    subject: `New website lead: ${source} — ${lead.firstName} ${lead.lastName}`,
    text: `${lines.join('\n')}\n`,
  };
}

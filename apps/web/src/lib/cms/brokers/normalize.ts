import { brokerSchema, type Broker } from '@mvp-realty/api-contracts';

import { normalizeOptionalMediaField } from '../media';
import { toTelHref } from '../phone';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function firstNameFrom(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

/** `null` for a bare id (unpopulated relation) or invalid shape. */
export function normalizeBroker(raw: unknown): Broker | null {
  if (typeof raw === 'number' || typeof raw === 'string') return null;
  if (!isRecord(raw)) return null;

  const slug = text(raw.slug);
  const name = text(raw.name);
  const title = text(raw.title);
  if (!slug || !name || !title) return null;

  const phone = text(raw.phone);
  const credentials = Array.isArray(raw.credentials)
    ? raw.credentials
        .map((row) => {
          if (!isRecord(row)) return null;
          const value = text(row.value);
          const label = text(row.label);
          if (!value || !label) return null;
          return { value, label };
        })
        .filter((row): row is { value: string; label: string } => row !== null)
        .slice(0, 3)
    : [];

  const rating = finiteNumber(raw.rating);
  const reviewCount = finiteNumber(raw.reviewCount);
  const avgResponseMinutes = finiteNumber(raw.avgResponseMinutes);

  const candidate = {
    slug,
    name,
    firstName: firstNameFrom(name),
    title,
    brokerage: text(raw.brokerage),
    conciergeLabel: text(raw.conciergeLabel) ?? 'Your {community} Concierge',
    headshot: normalizeOptionalMediaField(raw.headshot, name),
    phone,
    phoneHref: toTelHref(phone),
    email: text(raw.email),
    bio: text(raw.bio),
    signature: text(raw.signature),
    credentials,
    ...(rating != null ? { rating } : {}),
    ...(reviewCount != null ? { reviewCount: Math.max(0, Math.round(reviewCount)) } : {}),
    ...(avgResponseMinutes != null
      ? { avgResponseMinutes: Math.max(0, Math.round(avgResponseMinutes)) }
      : {}),
  };

  const parsed = brokerSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

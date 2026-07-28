/**
 * Derive a `tel:` href from a display phone string.
 * Digits only; `+1` for bare 10-digit US; `+` for 11 starting with 1;
 * pass through an existing `+`. Requires ≥7 digits else `undefined`.
 * No display reformatting — authored `phone` renders verbatim.
 */
export function toTelHref(phone?: string): string | undefined {
  if (!phone || typeof phone !== 'string') return undefined;

  const trimmed = phone.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    if (digits.length < 7) return undefined;
    return `tel:+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7) return undefined;
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `tel:+${digits}`;
  return `tel:+${digits}`;
}

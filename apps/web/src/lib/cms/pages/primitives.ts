export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback;
}

export function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function normalizeHeaderGroup(value: unknown) {
  const group = isRecord(value) ? value : {};
  return {
    anchorId: text(group.anchorId) || undefined,
    kicker: text(group.kicker, 'Featured'),
    heading: text(group.heading, 'Featured'),
    headingAccent: text(group.headingAccent) || undefined,
    lede: text(group.lede) || undefined,
  };
}

export function normalizeTags(value: unknown): string[] {
  return array(value)
    .map((item) => {
      if (typeof item === 'string') return item;
      if (isRecord(item)) return text(item.label);
      return '';
    })
    .filter(Boolean);
}

export function normalizeFormField(
  raw: unknown,
  label: string,
  placeholder: string,
  required: boolean,
) {
  const field = isRecord(raw) ? raw : {};
  return {
    label: text(field.label, label),
    placeholder: text(field.placeholder, placeholder),
    required: bool(field.required, required),
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

export function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function optionalNum(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function normalizeHeaderGroup(value: unknown) {
  const group = isRecord(value) ? value : {};
  return {
    anchorId: text(group.anchorId) || undefined,
    kicker: text(group.kicker),
    heading: text(group.heading),
    headingAccent: text(group.headingAccent) || undefined,
    lede: text(group.lede) || undefined,
  };
}

export function normalizeTags(value: unknown): string[] {
  return array(value)
    .map((item) => {
      if (typeof item === 'string') return text(item);
      if (isRecord(item)) return text(item.label);
      return '';
    })
    .filter(Boolean);
}

export function mapValidRows<T>(
  value: unknown,
  mapper: (row: Record<string, unknown>) => T | null,
): T[] {
  return array(value).flatMap((item) => {
    if (!isRecord(item)) return [];

    try {
      const mapped = mapper(item);
      return mapped === null ? [] : [mapped];
    } catch {
      return [];
    }
  });
}

export function normalizeFormField(raw: unknown, required: boolean) {
  const field = isRecord(raw) ? raw : {};
  return {
    label: text(field.label),
    placeholder: text(field.placeholder),
    required: bool(field.required, required),
  };
}

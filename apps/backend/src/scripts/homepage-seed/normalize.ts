const generatedKeys = new Set(['id', 'createdAt', 'updatedAt']);

function projectToShape(current: unknown, desired: unknown): unknown {
  if (Array.isArray(desired)) {
    if (!Array.isArray(current)) return current;
    return current.map((item, index) =>
      index < desired.length ? projectToShape(item, desired[index]) : item,
    );
  }

  if (desired && typeof desired === 'object') {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return current;

    return Object.fromEntries(
      Object.entries(desired).map(([key, value]) => [
        key,
        projectToShape((current as Record<string, unknown>)[key], value),
      ]),
    );
  }

  return current;
}

export function normalizeSeedValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeSeedValue);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key, entry]) => !generatedKeys.has(key) && entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, normalizeSeedValue(entry)]),
    );
  }

  return value;
}

export function seedDataMatches(current: unknown, desired: unknown): boolean {
  return seedDataDifferencePaths(current, desired).length === 0;
}

export function seedDataDifferencePaths(current: unknown, desired: unknown): string[] {
  const actual = normalizeSeedValue(projectToShape(current, desired));
  const expected = normalizeSeedValue(desired);
  const differences: string[] = [];

  function visit(left: unknown, right: unknown, path: string): void {
    if (Array.isArray(right)) {
      if (!Array.isArray(left) || left.length !== right.length) {
        differences.push(path || '<root>');
        return;
      }
      right.forEach((entry, index) => visit(left[index], entry, `${path}[${index}]`));
      return;
    }

    if (right && typeof right === 'object') {
      if (!left || typeof left !== 'object' || Array.isArray(left)) {
        differences.push(path || '<root>');
        return;
      }
      for (const [key, value] of Object.entries(right)) {
        visit((left as Record<string, unknown>)[key], value, path ? `${path}.${key}` : key);
      }
      return;
    }

    if (!Object.is(left, right)) differences.push(path || '<root>');
  }

  visit(actual, expected, '');
  return differences;
}

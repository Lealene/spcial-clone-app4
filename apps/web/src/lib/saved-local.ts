const COMMUNITIES_KEY = 'mvp-realty:saved-communities';
const LISTINGS_KEY = 'mvp-realty:saved-listings';

function readIds(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  window.localStorage.setItem(key, JSON.stringify(ids));
}

function toggleId(key: string, id: string): boolean {
  const current = readIds(key);
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  writeIds(key, next);
  return next.includes(id);
}

export function isCommunitySaved(slug: string): boolean {
  return readIds(COMMUNITIES_KEY).includes(slug);
}

export function toggleSavedCommunity(slug: string): boolean {
  return toggleId(COMMUNITIES_KEY, slug);
}

export function isListingSaved(slug: string): boolean {
  return readIds(LISTINGS_KEY).includes(slug);
}

export function toggleSavedListing(slug: string): boolean {
  return toggleId(LISTINGS_KEY, slug);
}

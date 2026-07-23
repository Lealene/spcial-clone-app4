import { env } from '@/env';

export async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(new URL(path, env.NEXT_PUBLIC_BACKEND_URL), {
    next: { tags: ['cms'] },
  });

  if (!response.ok) throw new Error(`CMS fetch failed: ${response.status}`);
  return response.json();
}

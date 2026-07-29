import { cmsRevalidateRequestSchema } from '@mvp-realty/api-contracts';
import { revalidateTag } from 'next/cache';

import { env } from '@/env';

/**
 * Invalidates CMS Data Cache entries on demand. Payload `afterChange` hooks call
 * this so an edit shows up on the next page load instead of waiting out the
 * `revalidate` window in `lib/cms/client.ts`.
 */
export async function POST(request: Request): Promise<Response> {
  if (!env.CMS_REVALIDATE_SECRET) {
    console.error('CMS_REVALIDATE_SECRET is not set — refusing to revalidate.');
    return Response.json({ ok: false, error: 'Revalidation is not configured.' }, { status: 500 });
  }

  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : undefined;
  if (token !== env.CMS_REVALIDATE_SECRET) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = cmsRevalidateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: 'Invalid tags.' }, { status: 400 });
  }

  // `expire: 0` rather than the 'max' profile: stale-while-revalidate would serve
  // one more stale response before refreshing, which is the delay we are removing.
  for (const tag of parsed.data.tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ ok: true, tags: parsed.data.tags });
}

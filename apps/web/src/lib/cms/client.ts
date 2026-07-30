import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';

import { env } from '@/env';
import { CmsDataError } from './errors';

type FetchJsonOptions = {
  tags?: string[];
  /**
   * Per-call time window, in seconds. Rarely needed — prefer `export const
   * revalidate` on the route, since the lowest value across a route's layout and
   * pages wins and a value here would silently cap every route that reads it.
   */
  revalidate?: number | false;
};

/**
 * Cache until a tag purge, not on a clock. Payload's `afterChange` hooks call
 * `/api/revalidate` on every edit, so tags are the real invalidation mechanism;
 * each route declares its own missed-webhook backstop via `export const
 * revalidate`. A number here would become the ceiling for every route in the app,
 * because the root layout fetches the header and footer on all of them.
 */
const DEFAULT_REVALIDATE = false;

export async function fetchJson(path: string, options: FetchJsonOptions = {}): Promise<unknown> {
  const resource = path.split('?')[0] ?? path;
  let response: Response;

  try {
    response = await fetch(new URL(path, env.NEXT_PUBLIC_BACKEND_URL), {
      next: {
        revalidate: options.revalidate ?? DEFAULT_REVALIDATE,
        tags: [CMS_CACHE_TAGS.all, ...(options.tags ?? [])],
      },
    });
  } catch (cause) {
    throw new CmsDataError('CMS request failed.', {
      kind: 'request-failed',
      resource,
      cause,
    });
  }

  if (!response.ok) {
    throw new CmsDataError(`CMS request failed with status ${response.status}.`, {
      kind: 'request-failed',
      resource,
      status: response.status,
    });
  }

  try {
    return await response.json();
  } catch (cause) {
    throw new CmsDataError('CMS returned an invalid JSON response.', {
      kind: 'invalid-response',
      resource,
      cause,
    });
  }
}

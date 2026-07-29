import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';

import { env } from '@/env';
import { CmsDataError } from './errors';

type FetchJsonOptions = {
  tags?: string[];
};

export async function fetchJson(path: string, options: FetchJsonOptions = {}): Promise<unknown> {
  const resource = path.split('?')[0] ?? path;
  let response: Response;

  try {
    response = await fetch(new URL(path, env.NEXT_PUBLIC_BACKEND_URL), {
      next: { revalidate: 300, tags: [CMS_CACHE_TAGS.all, ...(options.tags ?? [])] },
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

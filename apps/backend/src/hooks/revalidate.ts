import { type CmsRevalidateRequest } from '@mvp-realty/api-contracts';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
  RequestContext,
} from 'payload';

/**
 * Set `context: { disableRevalidate: true }` on a write to skip its cache
 * invalidation. Bulk writers use this and invalidate once when they finish,
 * rather than once per document.
 */
export const DISABLE_REVALIDATE = 'disableRevalidate';

/** A hung web app must not hold an admin save open indefinitely. */
const REQUEST_TIMEOUT_MS = 5_000;

/**
 * Ask the web app to drop the given Data Cache tags.
 *
 * Never throws: the document is already written, and the web app still has
 * time-based revalidation as a backstop, so a web outage must not fail a save.
 */
export async function revalidateWebTags(payload: Payload, tags: string[]): Promise<void> {
  const unique = [...new Set(tags)];
  if (unique.length === 0) return;

  // Imported here rather than at module scope so that attaching these hooks does
  // not make a collection config unimportable without a fully validated env.
  const { env, hasRevalidateConfig } = await import('../env');
  if (!hasRevalidateConfig()) return;

  const target = `${env.WEB_APP_URL!.replace(/\/$/, '')}/api/revalidate`;
  const body: CmsRevalidateRequest = { tags: unique };

  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.CMS_REVALIDATE_SECRET!}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      payload.logger.warn({
        status: response.status,
        tags: unique,
        msg: 'Web cache revalidation was rejected',
      });
    }
  } catch (error) {
    payload.logger.warn({
      err: error,
      tags: unique,
      msg: 'Web cache revalidation request failed',
    });
  }
}

/** Static tags, or tags derived from the document that changed. */
type TagsInput = string[] | ((doc: unknown, previousDoc?: unknown) => string[]);

function resolveTags(tags: TagsInput, doc: unknown, previousDoc?: unknown): string[] {
  return typeof tags === 'function' ? tags(doc, previousDoc) : tags;
}

function isSuppressed(context: RequestContext): boolean {
  return (context as Record<string, unknown>)[DISABLE_REVALIDATE] === true;
}

export function revalidateAfterChange(tags: TagsInput): CollectionAfterChangeHook {
  return async ({ context, doc, previousDoc, req }) => {
    if (!isSuppressed(context)) {
      await revalidateWebTags(req.payload, resolveTags(tags, doc, previousDoc));
    }
    return doc;
  };
}

export function revalidateAfterDelete(tags: TagsInput): CollectionAfterDeleteHook {
  return async ({ context, doc, req }) => {
    if (!isSuppressed(context)) {
      await revalidateWebTags(req.payload, resolveTags(tags, doc));
    }
    return doc;
  };
}

export function revalidateGlobalAfterChange(tags: string[]): GlobalAfterChangeHook {
  return async ({ context, doc, req }) => {
    if (!isSuppressed(context)) {
      await revalidateWebTags(req.payload, tags);
    }
    return doc;
  };
}

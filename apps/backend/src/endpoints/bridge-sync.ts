import type { Endpoint, PayloadRequest } from 'payload';

import { env } from '../env';
import { syncBridgeListings } from '../jobs/sync-bridge-listings';

function isAuthorized(req: PayloadRequest): boolean {
  if (req.user) return true;

  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return false;
  const token = header.slice('Bearer '.length).trim();
  return Boolean(env.BRIDGE_SYNC_SECRET && token === env.BRIDGE_SYNC_SECRET);
}

async function parseBody(req: PayloadRequest): Promise<{ areaSlug?: string; full?: boolean }> {
  try {
    const json = (await req.json?.()) as { areaSlug?: string; full?: boolean } | null;
    return {
      areaSlug: typeof json?.areaSlug === 'string' ? json.areaSlug : undefined,
      full: Boolean(json?.full),
    };
  } catch {
    return {};
  }
}

export const bridgeSyncEndpoint: Endpoint = {
  path: '/bridge/sync',
  method: 'post',
  handler: async (req) => {
    if (!isAuthorized(req)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await parseBody(req);

    try {
      const result = await syncBridgeListings(req.payload, {
        trigger: 'manual',
        areaSlug: body.areaSlug,
        full: body.full,
      });

      // Process a batch of queued hero mirrors after the sync upserts
      await req.payload.jobs.run({ limit: 50 });

      return Response.json({
        ok: true,
        syncLogId: result.syncLogId,
        status: result.status,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      req.payload.logger.error({ err: error, msg: 'Manual Bridge sync failed' });
      return Response.json({ error: message }, { status: 500 });
    }
  },
};

import type { Endpoint } from 'payload';

import { resyncLead } from '../services/leads/resync';

/**
 * Retry one lead's Wise Agent sync from its admin edit view.
 *
 * Mounted on the Leads collection, so the path is POST /api/leads/:id/resync.
 * Session-gated only: unlike the public ingest endpoint there is no machine
 * caller, and the admin button sends its cookie with `credentials: 'include'`.
 *
 * Bulk recovery stays in `pnpm -C apps/backend leads:resync` — a single button
 * that re-mails every stalled lead is too easy to fire twice.
 */
export const leadsResyncEndpoint: Endpoint = {
  path: '/:id/resync',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leadId = req.routeParams?.id;
    if (typeof leadId !== 'string' && typeof leadId !== 'number') {
      return Response.json({ error: 'Missing lead id' }, { status: 400 });
    }

    try {
      const result = await resyncLead(req.payload, leadId);

      req.payload.logger.info({
        leadId,
        status: result.status,
        msg: 'Lead resync retried from admin',
      });

      return Response.json({ ok: result.status === 'synced', ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      req.payload.logger.error({ err: error, leadId, msg: 'Lead resync failed' });
      return Response.json({ error: message }, { status: 500 });
    }
  },
};

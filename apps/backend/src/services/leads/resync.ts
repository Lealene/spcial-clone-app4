import type { LeadCrmStatus } from '@mvp-realty/api-contracts';
import type { Payload } from 'payload';

import { syncLeadToWiseAgent } from '../../jobs/sync-lead-to-wise-agent';

/**
 * Statuses worth retrying. `synced` is excluded so a resync never re-sends a
 * lead the CRM already has.
 */
export const RESYNCABLE_LEAD_STATUSES: LeadCrmStatus[] = ['pending', 'failed', 'skipped'];

export type ResyncLeadsArgs = {
  statuses: LeadCrmStatus[];
  limit: number;
};

export type ResyncLeadsResult = {
  requeued: number;
  /** How many leads matched, which may exceed `requeued` when `limit` clipped it. */
  totalMatching: number;
};

/**
 * Retry one lead's Wise Agent sync and report what happened.
 *
 * Backs the per-lead retry button in the admin edit view. Runs the sync inline
 * rather than through the queue: the button needs this lead's outcome, and
 * `jobs.run({ limit: 1 })` would just drain whichever job is next in line.
 *
 * `syncLeadToWiseAgent` already records its own failure on the lead before
 * rethrowing, so a throw here needs no extra bookkeeping — only reporting.
 */
export async function resyncLead(
  payload: Payload,
  leadId: number | string,
): Promise<{ status: LeadCrmStatus; error?: string }> {
  try {
    const { status } = await syncLeadToWiseAgent(payload, leadId);
    return { status };
  } catch (error) {
    return { status: 'failed', error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Requeue leads whose Wise Agent sync never landed, then drain the queue.
 *
 * Recovery path for a mail-provider outage, a blocked SMTP port, or the backlog
 * that accumulates while WISE_AGENT_LEAD_EMAIL / the transport is unset (those
 * land as `skipped`). Draining inline rather than waiting on autoRun lets the
 * caller — CLI or admin button — report real outcomes.
 */
export async function resyncLeads(
  payload: Payload,
  { statuses, limit }: ResyncLeadsArgs,
): Promise<ResyncLeadsResult> {
  const stale = await payload.find({
    collection: 'leads',
    where: { 'crm.status': { in: statuses } },
    limit,
    depth: 0,
    sort: 'createdAt',
    overrideAccess: true,
  });

  for (const lead of stale.docs) {
    await payload.update({
      collection: 'leads',
      id: lead.id,
      data: { crm: { status: 'pending', error: null } },
      overrideAccess: true,
    });

    await payload.jobs.queue({
      task: 'syncLeadToWiseAgent',
      input: { leadId: String(lead.id) },
      queue: 'default',
    });
  }

  if (stale.docs.length > 0) {
    await payload.jobs.run({ limit: Math.min(stale.docs.length, limit) });
  }

  return { requeued: stale.docs.length, totalMatching: stale.totalDocs };
}

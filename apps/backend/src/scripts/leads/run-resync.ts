/**
 * Requeue leads whose Wise Agent sync never landed.
 *
 *   pnpm -C apps/backend leads:resync              # pending + failed + skipped
 *   pnpm -C apps/backend leads:resync failed       # one status only
 *   pnpm -C apps/backend leads:resync --limit=50
 *
 * Recovery path for a mail-provider outage or the backlog that accumulates while
 * WISE_AGENT_LEAD_EMAIL or the SMTP transport is unset (those land as `skipped`).
 */
import { getPayload } from 'payload';

import config from '@payload-config';

import { LEAD_CRM_STATUSES, type LeadCrmStatus } from '@mvp-realty/api-contracts';

const RESYNCABLE: LeadCrmStatus[] = ['pending', 'failed', 'skipped'];

const statusArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : 500;

if (statusArg && !LEAD_CRM_STATUSES.includes(statusArg as LeadCrmStatus)) {
  throw new Error(
    `Unknown status "${statusArg}". Expected one of: ${LEAD_CRM_STATUSES.join(', ')}.`,
  );
}
if (!Number.isFinite(limit) || limit <= 0) {
  throw new Error(`--limit must be a positive number, received "${limitArg}".`);
}

const statuses = statusArg ? [statusArg as LeadCrmStatus] : RESYNCABLE;

const payload = await getPayload({ config });

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

// Drain immediately rather than waiting on autoRun, so the CLI reports outcomes.
await payload.jobs.run({ limit: Math.min(stale.docs.length, limit) });

payload.logger.info({
  msg: 'Lead resync complete.',
  statuses,
  requeued: stale.docs.length,
  totalMatching: stale.totalDocs,
});

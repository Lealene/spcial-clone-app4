/**
 * Requeue leads whose Wise Agent sync never landed.
 *
 *   pnpm -C apps/backend leads:resync              # pending + failed + skipped
 *   pnpm -C apps/backend leads:resync failed       # one status only
 *   pnpm -C apps/backend leads:resync --limit=50
 *
 * Shell-based escape hatch. The same operation is available to admins from the
 * Leads list view (POST /api/leads/resync).
 */
import { getPayload } from 'payload';

import config from '@payload-config';

import { LEAD_CRM_STATUSES, type LeadCrmStatus } from '@mvp-realty/api-contracts';

import { RESYNCABLE_LEAD_STATUSES, resyncLeads } from '../../services/leads/resync';

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

const statuses = statusArg ? [statusArg as LeadCrmStatus] : RESYNCABLE_LEAD_STATUSES;

const payload = await getPayload({ config });

const result = await resyncLeads(payload, { statuses, limit });

payload.logger.info({
  msg: 'Lead resync complete.',
  statuses,
  requeued: result.requeued,
  totalMatching: result.totalMatching,
});

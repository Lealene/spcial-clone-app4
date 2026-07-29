import type { LeadCrmStatus } from '@mvp-realty/api-contracts';
import type { Payload, TaskConfig } from 'payload';

import { env, hasWiseAgentConfig } from '../env';
import { buildLeadCaptureEmail } from '../services/wise-agent/lead-email';

export type SyncLeadInput = {
  leadId: string;
};

export type SyncLeadResult = {
  status: LeadCrmStatus;
};

async function setCrmState(
  payload: Payload,
  leadId: number | string,
  crm: {
    status: LeadCrmStatus;
    syncedAt?: string;
    error?: string | null;
  },
): Promise<void> {
  await payload.update({
    collection: 'leads',
    id: leadId,
    data: { crm },
    overrideAccess: true,
  });
}

/**
 * Mirror one Payload lead into Wise Agent via its lead-capture email address.
 *
 * The lead is already saved by the time this runs — Payload is the source of
 * truth, so every failure path here leaves the lead intact and only records why
 * the CRM copy is missing.
 *
 * `synced` means the mail provider accepted the message, not that Wise Agent
 * created the contact. Email parsing is one-way and returns no identifier, so
 * that is the strongest confirmation available on this transport.
 */
export async function syncLeadToWiseAgent(
  payload: Payload,
  leadId: number | string,
): Promise<SyncLeadResult> {
  // depth 1 populates area and listing so the builder can read their fields.
  const lead = await payload.findByID({
    collection: 'leads',
    id: leadId,
    depth: 1,
    overrideAccess: true,
  });

  if (!hasWiseAgentConfig()) {
    // No lead-capture address or no SMTP transport. Not an error — mark it and
    // move on so the job queue does not fill with retries. `leads:resync` picks
    // these up later.
    payload.logger.warn({
      leadId,
      msg: 'Wise Agent lead email or SMTP transport is not configured — marking lead as skipped',
    });
    await setCrmState(payload, leadId, { status: 'skipped', error: null });
    return { status: 'skipped' };
  }

  const { subject, text } = buildLeadCaptureEmail(lead);

  try {
    await payload.sendEmail({
      to: env.WISE_AGENT_LEAD_EMAIL!,
      subject,
      text,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    payload.logger.error({ err: error, leadId, msg: 'Wise Agent lead email failed to send' });
    await setCrmState(payload, leadId, { status: 'failed', error: message });
    // Rethrow so Payload retries with backoff.
    throw error;
  }

  await setCrmState(payload, leadId, {
    status: 'synced',
    syncedAt: new Date().toISOString(),
    error: null,
  });

  return { status: 'synced' };
}

export const syncLeadToWiseAgentTask = {
  slug: 'syncLeadToWiseAgent',
  label: 'Sync lead to Wise Agent',
  inputSchema: [{ name: 'leadId', type: 'text', required: true }],
  outputSchema: [{ name: 'status', type: 'text', required: true }],
  retries: 3,
  handler: async ({ input, req }) => {
    const { leadId } = input as SyncLeadInput;
    const result = await syncLeadToWiseAgent(req.payload, leadId);
    return { output: { status: result.status } };
  },
} as TaskConfig;

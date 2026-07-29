import type { LeadSubmission } from '@mvp-realty/api-contracts';

export type LeadSubmitResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = 'We could not send your request. Please try again.';

/**
 * POST a lead to the app's own route handler, which holds the ingest secret.
 * Never throws — every form renders the returned error inline.
 */
export async function submitLead(submission: LeadSubmission): Promise<LeadSubmitResult> {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, error: body?.error ?? GENERIC_ERROR };
    }

    return { ok: true };
  } catch {
    // Offline, DNS failure, or the request was blocked.
    return { ok: false, error: GENERIC_ERROR };
  }
}

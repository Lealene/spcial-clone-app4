import { leadSubmissionSchema, type LeadSubmission } from '@mvp-realty/api-contracts';
import type { Endpoint, Payload, PayloadRequest } from 'payload';

import { env } from '../env';

/** Max submissions per IP per window. Generous for humans, useless for bots. */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

/**
 * In-memory, per-instance rate limiter. Deliberately not shared state — the
 * honeypot is the primary bot defence and this is just a burst cap, so a
 * multi-instance deploy allowing N× the rate is acceptable.
 */
const recentByIp = new Map<string, number[]>();

function isRateLimited(ip: string, now: number): boolean {
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const hits = (recentByIp.get(ip) ?? []).filter((at) => at > cutoff);
  hits.push(now);
  recentByIp.set(ip, hits);

  // Opportunistic sweep so the map cannot grow without bound.
  if (recentByIp.size > 5000) {
    for (const [key, times] of recentByIp) {
      if (times.every((at) => at <= cutoff)) recentByIp.delete(key);
    }
  }

  return hits.length > RATE_LIMIT_MAX;
}

function isAuthorized(req: PayloadRequest): boolean {
  if (req.user) return true;

  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return false;
  const token = header.slice('Bearer '.length).trim();
  return Boolean(env.LEADS_INGEST_SECRET && token === env.LEADS_INGEST_SECRET);
}

function clientIp(req: PayloadRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/** Resolve a slug to a document id, or undefined when it does not match. */
async function findIdBySlug(
  payload: Payload,
  collection: 'areas' | 'listings',
  slug: string | undefined,
): Promise<number | undefined> {
  if (!slug) return undefined;

  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  });

  const id = result.docs[0]?.id;
  return typeof id === 'number' ? id : undefined;
}

/**
 * Mounted on the Leads collection, not as a root endpoint, so the final URL is
 * `/api/leads/submit`. A root endpoint at that path is shadowed by the
 * collection's built-in `/api/leads/:id` route and 404s.
 */
export const leadsSubmitEndpoint: Endpoint = {
  path: '/submit',
  method: 'post',
  handler: async (req) => {
    if (!isAuthorized(req)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json?.();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = leadSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid lead submission', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const submission: LeadSubmission = parsed.data;

    // Honeypot. Report success so a bot learns nothing from the response.
    if (submission.company && submission.company.trim() !== '') {
      req.payload.logger.info({ msg: 'Lead submission dropped by honeypot' });
      return Response.json({ ok: true });
    }

    if (isRateLimited(clientIp(req), Date.now())) {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
      const [area, listing] = await Promise.all([
        findIdBySlug(req.payload, 'areas', submission.areaSlug),
        findIdBySlug(req.payload, 'listings', submission.listingSlug),
      ]);

      const lead = await req.payload.create({
        collection: 'leads',
        data: {
          firstName: submission.firstName,
          lastName: submission.lastName,
          email: submission.email,
          phone: submission.phone,
          message: submission.message,
          formType: submission.formType,
          surface: submission.surface,
          pageUrl: submission.pageUrl,
          area,
          listing,
          crm: { status: 'pending' },
        },
        overrideAccess: true,
      });

      // Queue, do not sync inline — a Wise Agent outage must not fail the form.
      // autoRun drains the `default` queue every minute.
      try {
        await req.payload.jobs.queue({
          task: 'syncLeadToWiseAgent',
          input: { leadId: String(lead.id) },
          queue: 'default',
        });
      } catch (error) {
        // The lead is saved, which is the part that matters. It stays at
        // crm.status 'pending' and `leads:resync` requeues it, so a broken queue
        // must not show the visitor an error for a request we did receive.
        req.payload.logger.error({
          err: error,
          leadId: lead.id,
          msg: 'Lead saved but Wise Agent sync could not be queued',
        });
      }

      return Response.json({ ok: true, leadId: lead.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      req.payload.logger.error({ err: error, msg: 'Lead submission failed' });
      return Response.json({ error: message }, { status: 500 });
    }
  },
};

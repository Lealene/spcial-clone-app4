import { leadSubmissionSchema } from '@mvp-realty/api-contracts';

import { env } from '@/env';

/**
 * Proxies a lead submission to the Payload ingest endpoint.
 *
 * Exists so the shared secret never reaches the browser and so the browser never
 * calls the backend origin directly (no CORS to configure). Validation runs here
 * *and* in Payload — the endpoint does not trust this proxy.
 */
export async function POST(request: Request): Promise<Response> {
  if (!env.LEADS_INGEST_SECRET) {
    console.error('LEADS_INGEST_SECRET is not set — refusing to forward a lead submission.');
    return Response.json({ ok: false, error: 'Lead capture is not configured.' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = leadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: 'Invalid submission.' }, { status: 400 });
  }

  const target = `${env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '')}/api/leads/submit`;

  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.LEADS_INGEST_SECRET}`,
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });

    if (!response.ok) {
      // Never surface backend internals to the browser; the form only needs ok/not-ok.
      console.error(`Lead ingest responded ${response.status}: ${await response.text()}`);
      return Response.json(
        { ok: false, error: 'We could not send your request. Please try again.' },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Lead ingest request failed', error);
    return Response.json(
      { ok: false, error: 'We could not send your request. Please try again.' },
      { status: 502 },
    );
  }
}

import type { EmailAdapter, SendEmailOptions } from 'payload';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/**
 * Fail fast rather than holding a job slot. Resend's API answers in well under a
 * second; anything near this is a network fault, and the caller retries.
 */
const REQUEST_TIMEOUT_MS = 10_000;

export type ResendAdapterArgs = {
  apiKey: string;
  defaultFromAddress: string;
  defaultFromName: string;
};

export type ResendSendEmailResponse = {
  id: string;
};

/** Nodemailer address shapes, narrowed to what Resend's JSON API accepts. */
type NodemailerAddress = SendEmailOptions['to'];

function formatAddress(value: string | { address: string; name?: string }): string {
  if (typeof value === 'string') return value;
  return value.name ? `${value.name} <${value.address}>` : value.address;
}

/**
 * Resend takes `string | string[]` for every address field, while Payload hands
 * us nodemailer's wider union (single value or array, plain or `{name, address}`).
 */
function toAddressList(value: NodemailerAddress): string[] | undefined {
  if (!value) return undefined;
  const values = Array.isArray(value) ? value : [value];
  const formatted = values
    .filter((entry): entry is string | { address: string; name?: string } => Boolean(entry))
    .map(formatAddress)
    .filter((entry) => entry.length > 0);
  return formatted.length > 0 ? formatted : undefined;
}

/** Resend returns `{ message }` on failure, but never rely on the body parsing. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body) {
      const { message } = body as { message?: unknown };
      if (typeof message === 'string' && message.length > 0) return message;
    }
    return JSON.stringify(body);
  } catch {
    return response.statusText || 'no response body';
  }
}

/**
 * Send mail through Resend's HTTPS API instead of SMTP.
 *
 * Railway blocks outbound SMTP ports (25/465/587), so `smtp.resend.com:465`
 * never completes its greeting there and nodemailer throws `Connection timeout`
 * — which surfaced as leads saved in Payload but never mirrored to Wise Agent.
 * Port 443 is not blocked anywhere, so this transport is the production path;
 * the nodemailer adapter stays wired up as the local/SMTP fallback.
 */
export const resendAdapter =
  ({
    apiKey,
    defaultFromAddress,
    defaultFromName,
  }: ResendAdapterArgs): EmailAdapter<ResendSendEmailResponse> =>
  () => ({
    name: 'resend',
    defaultFromAddress,
    defaultFromName,
    sendEmail: async (message) => {
      const to = toAddressList(message.to);
      if (!to) {
        throw new Error('Resend: cannot send an email with no recipient.');
      }

      const payload = {
        from: toAddressList(message.from)?.[0] ?? `${defaultFromName} <${defaultFromAddress}>`,
        to,
        cc: toAddressList(message.cc),
        bcc: toAddressList(message.bcc),
        reply_to: toAddressList(message.replyTo),
        subject: message.subject ?? '',
        ...(typeof message.text === 'string' ? { text: message.text } : {}),
        ...(typeof message.html === 'string' ? { html: message.html } : {}),
      };

      const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        // Thrown so the calling job records it and Payload retries with backoff.
        throw new Error(
          `Resend rejected the email (${response.status}): ${await readErrorMessage(response)}`,
        );
      }

      return (await response.json()) as ResendSendEmailResponse;
    },
  });

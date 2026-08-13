import type { Payload } from 'payload';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resendAdapter } from './resend-adapter';

const adapter = () =>
  resendAdapter({
    apiKey: 'test-key',
    defaultFromAddress: 'leads@example.com',
    defaultFromName: '55 Living Team',
  })({ payload: {} as Payload });

/** Resolve like Resend's 200 response. */
const ok = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ id: 'resend-message-id' }),
  } as unknown as Response);

/** The single fetch call's parsed JSON body. */
const sentBody = (fetchMock: ReturnType<typeof ok>) =>
  JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);

const init = (fetchMock: ReturnType<typeof ok>) => fetchMock.mock.calls[0]![1] as RequestInit;

let fetchMock: ReturnType<typeof ok>;

beforeEach(() => {
  fetchMock = ok();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resendAdapter', () => {
  it('posts to the Resend HTTP API with the bearer key, not SMTP', async () => {
    await adapter().sendEmail({ to: 'lead@example.com', subject: 'Hi', text: 'Body' });

    expect(fetchMock.mock.calls[0]![0]).toBe('https://api.resend.com/emails');
    expect(init(fetchMock).method).toBe('POST');
    expect((init(fetchMock).headers as Record<string, string>).Authorization).toBe(
      'Bearer test-key',
    );
  });

  it('attaches an abort signal so a blocked network fails fast', async () => {
    await adapter().sendEmail({ to: 'lead@example.com', subject: 'Hi', text: 'Body' });

    expect(init(fetchMock).signal).toBeInstanceOf(AbortSignal);
  });

  it('returns the provider message id', async () => {
    const result = await adapter().sendEmail({ to: 'lead@example.com', subject: 'Hi' });

    expect(result.id).toBe('resend-message-id');
  });

  it('falls back to the default from address when the message omits one', async () => {
    await adapter().sendEmail({ to: 'lead@example.com', subject: 'Hi' });

    expect(sentBody(fetchMock).from).toBe('55 Living Team <leads@example.com>');
  });

  it('prefers an explicit from address', async () => {
    await adapter().sendEmail({
      from: 'Someone <someone@example.com>',
      to: 'lead@example.com',
      subject: 'Hi',
    });

    expect(sentBody(fetchMock).from).toBe('Someone <someone@example.com>');
  });

  it('normalizes every nodemailer address shape into a string array', async () => {
    await adapter().sendEmail({
      to: ['a@example.com', { name: 'Bee', address: 'b@example.com' }],
      cc: 'c@example.com',
      replyTo: { address: 'reply@example.com' },
      subject: 'Hi',
    });

    const body = sentBody(fetchMock);
    expect(body.to).toEqual(['a@example.com', 'Bee <b@example.com>']);
    expect(body.cc).toEqual(['c@example.com']);
    expect(body.reply_to).toEqual(['reply@example.com']);
    expect(body.bcc).toBeUndefined();
  });

  it('sends text and html only when present', async () => {
    await adapter().sendEmail({ to: 'lead@example.com', subject: 'Hi', text: 'Plain' });

    const body = sentBody(fetchMock);
    expect(body.text).toBe('Plain');
    expect('html' in body).toBe(false);
  });

  it('throws with the provider message when Resend rejects the email', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'The example.com domain is not verified.' }),
      } as unknown as Response),
    );

    await expect(adapter().sendEmail({ to: 'lead@example.com', subject: 'Hi' })).rejects.toThrow(
      /403.*domain is not verified/,
    );
  });

  it('refuses to send with no recipient', async () => {
    await expect(adapter().sendEmail({ subject: 'Hi' })).rejects.toThrow(/no recipient/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

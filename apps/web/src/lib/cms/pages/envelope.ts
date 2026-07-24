import { z } from 'zod';

const payloadPageDocumentSchema = z
  .object({
    title: z.string().trim().min(1),
    slug: z.string().trim().min(1),
    seo: z.unknown().optional(),
    layout: z.array(z.unknown()),
  })
  .passthrough();

const payloadPageListResponseSchema = z
  .object({
    docs: z.array(z.unknown()),
  })
  .passthrough();

export type PayloadPageDocument = z.infer<typeof payloadPageDocumentSchema>;

export type PayloadPageEnvelopeResult =
  | { status: 'found'; page: PayloadPageDocument }
  | { status: 'missing' };

export function parsePayloadPageEnvelope(raw: unknown): PayloadPageEnvelopeResult {
  const response = payloadPageListResponseSchema.parse(raw);
  const firstDocument = response.docs[0];
  if (firstDocument === undefined) return { status: 'missing' };

  return {
    status: 'found',
    page: payloadPageDocumentSchema.parse(firstDocument),
  };
}

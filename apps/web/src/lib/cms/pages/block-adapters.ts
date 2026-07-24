import {
  CMS_PAGE_BLOCK_TYPES,
  cmsPageBlockSchemasByType,
  type CmsPageBlock,
  type CmsPageBlockType,
} from '@mvp-realty/api-contracts';
import type { ZodError } from 'zod';

import { normalizeAmenitiesBlock } from './adapters/amenities';
import { normalizeCommunitiesStripBlock } from './adapters/communities-strip';
import { normalizeFeaturedCommunitiesBlock } from './adapters/featured-communities';
import { normalizeFeaturedResidencesBlock } from './adapters/featured-residences';
import { normalizeHeroBlock } from './adapters/hero';
import { normalizeLeadCaptureBlock } from './adapters/lead-capture';
import { normalizeLifestyleBlock } from './adapters/lifestyle';
import { normalizeOwnerIntroBlock } from './adapters/owner-intro';
import { normalizeTestimonialsBlock } from './adapters/testimonials';
import { isRecord } from './primitives';

export type CmsPageBlockAdapter = (raw: Record<string, unknown>) => unknown;

export const cmsPageBlockAdapters = {
  hero: normalizeHeroBlock,
  communitiesStrip: normalizeCommunitiesStripBlock,
  featuredCommunities: normalizeFeaturedCommunitiesBlock,
  featuredResidences: normalizeFeaturedResidencesBlock,
  lifestyle: normalizeLifestyleBlock,
  testimonials: normalizeTestimonialsBlock,
  amenities: normalizeAmenitiesBlock,
  ownerIntro: normalizeOwnerIntroBlock,
  leadCapture: normalizeLeadCaptureBlock,
} satisfies Record<CmsPageBlockType, CmsPageBlockAdapter>;

export type CmsPageBlockDiagnosticCode = 'invalid-block' | 'unknown-block';

export type CmsPageBlockDiagnostic = {
  code: CmsPageBlockDiagnosticCode;
  pageSlug: string;
  layoutIndex: number;
  blockId?: string;
  blockType?: string;
  issues: Array<{ path: string; code: string }>;
};

type CmsPageBlockNormalizationResult =
  | { status: 'valid'; block: CmsPageBlock }
  | { status: 'disabled' }
  | { status: 'invalid'; diagnostic: CmsPageBlockDiagnostic }
  | { status: 'unknown'; diagnostic: CmsPageBlockDiagnostic };

const cmsPageBlockTypeSet = new Set<string>(CMS_PAGE_BLOCK_TYPES);
const MAX_DIAGNOSTICS = 10;
const MAX_DIAGNOSTIC_ISSUES = 5;

function blockIdentity(raw: Record<string, unknown>) {
  return {
    blockId: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : undefined,
    blockType: typeof raw.blockType === 'string' ? raw.blockType : undefined,
  };
}

function zodIssues(error: ZodError): CmsPageBlockDiagnostic['issues'] {
  return error.issues.slice(0, MAX_DIAGNOSTIC_ISSUES).map((issue) => ({
    path: issue.path.map(String).join('.'),
    code: issue.code,
  }));
}

function invalidDiagnostic(
  raw: Record<string, unknown>,
  pageSlug: string,
  layoutIndex: number,
  issues: CmsPageBlockDiagnostic['issues'],
): CmsPageBlockDiagnostic {
  return {
    code: 'invalid-block',
    pageSlug,
    layoutIndex,
    ...blockIdentity(raw),
    issues: issues.slice(0, MAX_DIAGNOSTIC_ISSUES),
  };
}

function normalizeCmsPageBlockEntry(
  raw: unknown,
  pageSlug: string,
  layoutIndex: number,
): CmsPageBlockNormalizationResult {
  if (!isRecord(raw)) {
    return {
      status: 'invalid',
      diagnostic: {
        code: 'invalid-block',
        pageSlug,
        layoutIndex,
        issues: [{ path: '', code: 'invalid_type' }],
      },
    };
  }

  if (raw.enabled === false) return { status: 'disabled' };

  if (typeof raw.blockType !== 'string' || !cmsPageBlockTypeSet.has(raw.blockType)) {
    return {
      status: 'unknown',
      diagnostic: {
        code: 'unknown-block',
        pageSlug,
        layoutIndex,
        ...blockIdentity(raw),
        issues: [],
      },
    };
  }

  const blockType = raw.blockType as CmsPageBlockType;

  try {
    const normalized = cmsPageBlockAdapters[blockType](raw);
    const candidate = isRecord(normalized)
      ? {
          ...normalized,
          id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : undefined,
        }
      : normalized;
    const parsed = cmsPageBlockSchemasByType[blockType].safeParse(candidate);

    if (!parsed.success) {
      return {
        status: 'invalid',
        diagnostic: invalidDiagnostic(raw, pageSlug, layoutIndex, zodIssues(parsed.error)),
      };
    }

    return { status: 'valid', block: parsed.data as CmsPageBlock };
  } catch {
    return {
      status: 'invalid',
      diagnostic: invalidDiagnostic(raw, pageSlug, layoutIndex, [
        { path: '', code: 'adapter_error' },
      ]),
    };
  }
}

export function normalizeCmsPageBlocks(
  rawLayout: readonly unknown[],
  pageSlug: string,
): { blocks: CmsPageBlock[]; diagnostics: CmsPageBlockDiagnostic[] } {
  const blocks: CmsPageBlock[] = [];
  const diagnostics: CmsPageBlockDiagnostic[] = [];

  rawLayout.forEach((raw, layoutIndex) => {
    const result = normalizeCmsPageBlockEntry(raw, pageSlug, layoutIndex);

    if (result.status === 'valid') {
      blocks.push(result.block);
      return;
    }

    if (
      (result.status === 'invalid' || result.status === 'unknown') &&
      diagnostics.length < MAX_DIAGNOSTICS
    ) {
      diagnostics.push(result.diagnostic);
    }
  });

  return { blocks, diagnostics };
}

export function normalizeCmsPageBlock(raw: unknown): CmsPageBlock | null {
  const result = normalizeCmsPageBlockEntry(raw, 'unknown', 0);
  return result.status === 'valid' ? result.block : null;
}

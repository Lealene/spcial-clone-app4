import { CMS_PAGE_BLOCK_TYPES, cmsAnchorIdSchema, cmsHrefSchema } from '@mvp-realty/api-contracts';
import { getPayload } from 'payload';

import config from '@payload-config';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

type AuditSummary = {
  pages: number;
  versions: number;
  blocks: number;
  blocksByType: Record<string, number>;
  disabledBlocks: number;
  missingBlockIds: number;
  duplicateBlockIds: number;
  unknownBlocks: number;
  invalidAnchors: number;
  unsafeCustomUrls: number;
  unresolvedInternalLinks: number;
  unresolvedMedia: number;
  divergentCtaLabels: number;
  futureFieldUsage: Record<string, number>;
};

const knownBlockTypes = new Set<string>(CMS_PAGE_BLOCK_TYPES);
const mediaFieldNames = new Set([
  'backgroundImage',
  'featureImage',
  'image',
  'portrait',
  'ogImage',
  'twitterImage',
]);
const futureFieldNames = new Set([
  'sourceMode',
  'icon',
  'price',
  'emptyStateHeading',
  'emptyStateBody',
]);

function increment(record: Record<string, number>, key: string): void {
  const counts = record;
  counts[key] = (counts[key] ?? 0) + 1;
}

function auditValue(value: unknown, summary: AuditSummary, key?: string): void {
  const audit = summary;
  if (Array.isArray(value)) {
    value.forEach((item) => auditValue(item, summary, key));
    return;
  }
  if (!isRecord(value)) return;

  if (key && mediaFieldNames.has(key)) {
    const relationship = isRecord(value.image) ? value.image : value;
    if (
      typeof value.image === 'number' ||
      (typeof relationship.id === 'number' && !relationship.url)
    ) {
      audit.unresolvedMedia += 1;
    }
  }

  if (
    typeof value.label === 'string' &&
    isRecord(value.link) &&
    typeof value.link.label === 'string' &&
    value.label !== value.link.label
  ) {
    audit.divergentCtaLabels += 1;
  }

  Object.entries(value).forEach(([childKey, childValue]) => {
    if (childKey === 'anchorId' && typeof childValue === 'string') {
      if (!cmsAnchorIdSchema.safeParse(childValue).success) audit.invalidAnchors += 1;
    }
    if (childKey === 'customUrl' && typeof childValue === 'string') {
      if (!cmsHrefSchema.safeParse(childValue).success) audit.unsafeCustomUrls += 1;
    }
    if (childKey === 'page' && typeof childValue === 'number') {
      audit.unresolvedInternalLinks += 1;
    }
    if (futureFieldNames.has(childKey) && childValue !== undefined && childValue !== null) {
      increment(audit.futureFieldUsage, childKey);
    }
    auditValue(childValue, audit, childKey);
  });
}

function auditDocument(document: unknown, summary: AuditSummary): void {
  if (!isRecord(document)) return;
  const audit = summary;
  const layout = Array.isArray(document.layout) ? document.layout : [];
  const seenIds = new Set<string>();

  layout.forEach((block) => {
    if (!isRecord(block)) return;
    audit.blocks += 1;
    const blockType = typeof block.blockType === 'string' ? block.blockType : 'missing';
    increment(audit.blocksByType, blockType);
    if (!knownBlockTypes.has(blockType)) audit.unknownBlocks += 1;
    if (block.enabled === false) audit.disabledBlocks += 1;

    if (typeof block.id !== 'string' || block.id.length === 0) {
      audit.missingBlockIds += 1;
    } else if (seenIds.has(block.id)) {
      audit.duplicateBlockIds += 1;
    } else {
      seenIds.add(block.id);
    }

    auditValue(block, audit);
  });
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const [pages, versions] = await Promise.all([
    payload.find({
      collection: 'pages',
      depth: 1,
      draft: true,
      limit: 1000,
      overrideAccess: true,
    }),
    payload.findVersions({
      collection: 'pages',
      depth: 1,
      limit: 1000,
      overrideAccess: true,
    }),
  ]);

  const summary: AuditSummary = {
    pages: pages.docs.length,
    versions: versions.totalDocs,
    blocks: 0,
    blocksByType: {},
    disabledBlocks: 0,
    missingBlockIds: 0,
    duplicateBlockIds: 0,
    unknownBlocks: 0,
    invalidAnchors: 0,
    unsafeCustomUrls: 0,
    unresolvedInternalLinks: 0,
    unresolvedMedia: 0,
    divergentCtaLabels: 0,
    futureFieldUsage: {},
  };

  pages.docs.forEach((page) => auditDocument(page, summary));
  versions.docs.forEach((version) => {
    if (isRecord(version)) auditDocument(version.version, summary);
  });

  payload.logger.info({
    msg: 'CMS block audit completed. Counts only; no editorial values were logged.',
    summary,
  });
}

await main();

import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';
import { getPayload, type Payload } from 'payload';

import config from '@payload-config';

import { DISABLE_REVALIDATE, revalidateWebTags } from '../hooks/revalidate';

const replacementBrand = '55 Living Team';
const legacyBrandPattern = /\bMVP\s+Real(?:t|i)y\b/gi;
const systemFields = new Set(['id', 'createdAt', 'updatedAt', 'globalType']);

const collectionTargets = [
  { slug: 'pages' },
  { slug: 'areas' },
  { slug: 'brokers' },
  { slug: 'listings' },
  { slug: 'media', allowedFields: new Set(['alt']) },
] as const;

const globalTargets = ['site-settings', 'header', 'footer', 'privacy-policy'] as const;

type Hit = {
  occurrences: number;
  path: string;
  target: string;
};

type RewriteResult = {
  changed: boolean;
  value: unknown;
};

type CleanupSummary = {
  changedDocuments: Record<string, number>;
  hits: Hit[];
  occurrences: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function replacementFor(match: string): string {
  return match === match.toUpperCase() ? replacementBrand.toUpperCase() : replacementBrand;
}

function rewriteValue(value: unknown, target: string, path: string, hits: Hit[]): RewriteResult {
  if (typeof value === 'string') {
    const matches = value.match(new RegExp(legacyBrandPattern.source, legacyBrandPattern.flags));
    if (!matches) return { changed: false, value };

    hits.push({ occurrences: matches.length, path, target });
    return {
      changed: true,
      value: value.replace(
        new RegExp(legacyBrandPattern.source, legacyBrandPattern.flags),
        replacementFor,
      ),
    };
  }

  if (Array.isArray(value)) {
    let changed = false;
    const rewritten = value.map((entry, index) => {
      const result = rewriteValue(entry, target, `${path}[${index}]`, hits);
      changed ||= result.changed;
      return result.value;
    });
    return { changed, value: changed ? rewritten : value };
  }

  if (!isRecord(value)) return { changed: false, value };

  let changed = false;
  const rewritten: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    const result = rewriteValue(entry, target, path ? `${path}.${key}` : key, hits);
    changed ||= result.changed;
    rewritten[key] = result.value;
  }

  return { changed, value: changed ? rewritten : value };
}

function changedTopLevelFields(
  document: Record<string, unknown>,
  target: string,
  hits: Hit[],
  allowedFields?: ReadonlySet<string>,
): Record<string, unknown> {
  const changed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(document)) {
    if (systemFields.has(key) || (allowedFields && !allowedFields.has(key))) continue;

    const result = rewriteValue(value, target, key, hits);
    if (result.changed) changed[key] = result.value;
  }

  return changed;
}

function increment(record: Record<string, number>, key: string): void {
  const counts = record;
  counts[key] = (counts[key] ?? 0) + 1;
}

async function cleanCollections(
  payload: Payload,
  apply: boolean,
  summary: CleanupSummary,
): Promise<void> {
  for (const target of collectionTargets) {
    let page = 1;

    while (true) {
      const result = await payload.find({
        collection: target.slug,
        depth: 0,
        limit: 100,
        overrideAccess: true,
        page,
        sort: 'id',
      });

      for (const document of result.docs) {
        const data = changedTopLevelFields(
          document as unknown as Record<string, unknown>,
          `${target.slug}:${document.id}`,
          summary.hits,
          'allowedFields' in target ? target.allowedFields : undefined,
        );
        if (Object.keys(data).length === 0) continue;

        increment(summary.changedDocuments, target.slug);
        if (apply) {
          await payload.update({
            collection: target.slug,
            id: document.id,
            data: data as never,
            context: { [DISABLE_REVALIDATE]: true },
            overrideAccess: true,
          });
        }
      }

      if (!result.hasNextPage || typeof result.nextPage !== 'number') break;
      page = result.nextPage;
    }
  }
}

async function cleanGlobals(
  payload: Payload,
  apply: boolean,
  summary: CleanupSummary,
): Promise<void> {
  for (const slug of globalTargets) {
    const document = await payload.findGlobal({ slug, depth: 0, overrideAccess: true });
    const data = changedTopLevelFields(
      document as unknown as Record<string, unknown>,
      `global:${slug}`,
      summary.hits,
    );
    if (slug === 'site-settings' && (document.id === null || document.id === undefined)) {
      data.name = replacementBrand;
    }
    if (Object.keys(data).length === 0) continue;

    increment(summary.changedDocuments, `global:${slug}`);
    if (apply) {
      await payload.updateGlobal({
        slug,
        data: data as never,
        context: { [DISABLE_REVALIDATE]: true },
        overrideAccess: true,
      });
    }
  }
}

async function cleanPageVersions(
  payload: Payload,
  apply: boolean,
  summary: CleanupSummary,
): Promise<void> {
  let page = 1;

  while (true) {
    const result = await payload.findVersions({
      collection: 'pages',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      page,
      sort: 'id',
    });

    for (const versionDocument of result.docs) {
      const rewritten = rewriteValue(
        versionDocument.version,
        `pages-version:${versionDocument.id}`,
        'version',
        summary.hits,
      );
      if (!rewritten.changed || !isRecord(rewritten.value)) continue;

      increment(summary.changedDocuments, 'pages-versions');
      if (apply) {
        const versionData = {
          version: rewritten.value,
          ...(typeof versionDocument.parent === 'number' ||
          typeof versionDocument.parent === 'string'
            ? { parent: versionDocument.parent }
            : {}),
          ...(typeof versionDocument.createdAt === 'string'
            ? { createdAt: versionDocument.createdAt }
            : {}),
          ...(typeof versionDocument.updatedAt === 'string'
            ? { updatedAt: versionDocument.updatedAt }
            : {}),
          ...(typeof versionDocument.latest === 'boolean'
            ? { latest: versionDocument.latest }
            : {}),
        };

        await payload.db.updateVersion({
          collection: 'pages',
          id: versionDocument.id,
          versionData: versionData as never,
        });
      }
    }

    if (!result.hasNextPage || typeof result.nextPage !== 'number') break;
    page = result.nextPage;
  }
}

async function scanOrApply(payload: Payload, apply: boolean): Promise<CleanupSummary> {
  const summary: CleanupSummary = { changedDocuments: {}, hits: [], occurrences: 0 };

  await cleanCollections(payload, apply, summary);
  await cleanGlobals(payload, apply, summary);
  await cleanPageVersions(payload, apply, summary);
  summary.occurrences = summary.hits.reduce((total, hit) => total + hit.occurrences, 0);

  return summary;
}

async function main(): Promise<void> {
  const apply = process.argv.includes('apply');
  const payload = await getPayload({ config });

  try {
    const summary = await scanOrApply(payload, apply);
    payload.logger.info({
      mode: apply ? 'apply' : 'scan',
      msg: 'Public brand cleanup completed. Field paths are logged without field values.',
      summary,
    });

    if (!apply) return;

    await revalidateWebTags(payload, [CMS_CACHE_TAGS.all]);
    const verification = await scanOrApply(payload, false);
    payload.logger.info({
      msg: 'Public brand cleanup read-back completed.',
      verification,
    });

    if (verification.occurrences > 0) {
      throw new Error(`Brand cleanup left ${verification.occurrences} matching occurrences.`);
    }
  } finally {
    await payload.destroy();
  }
}

await main();

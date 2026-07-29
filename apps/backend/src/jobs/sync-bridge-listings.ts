import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';
import type { Payload, TaskConfig } from 'payload';

import { hasBridgeConfig, env } from '../env';
import { DISABLE_REVALIDATE, revalidateWebTags } from '../hooks/revalidate';
import { BridgeClient } from '../services/bridge/client';
import { mapBridgePropertyToListing } from '../services/bridge/mapper';
import { computeAndWriteAreaStats } from './compute-area-stats';

/**
 * A sync touches every listing in an area. Per-document invalidation would fire
 * hundreds of identical requests, so writes opt out and the run invalidates once.
 */
const SYNC_CONTEXT = { [DISABLE_REVALIDATE]: true };

export type SyncTrigger = 'cron' | 'manual';

export type SyncBridgeInput = {
  trigger: SyncTrigger;
  areaSlug?: string;
  /** Force full fetch + deactivate missing listings (weekly reconcile). */
  full?: boolean;
};

export type AreaSyncResult = {
  area: number;
  areaSlug: string;
  fetched: number;
  created: number;
  updated: number;
  deactivated: number;
  warnings: { item: string }[];
  errors: { item: string }[];
  heroJobsQueued: number;
};

function shouldReconcile(full: boolean | undefined, trigger: SyncTrigger): boolean {
  if (full) return true;
  // Weekly reconcile on Sundays for cron runs
  if (trigger === 'cron' && new Date().getUTCDay() === 0) return true;
  return false;
}

function createBridgeClient(): BridgeClient {
  if (!hasBridgeConfig()) {
    throw new Error('BRIDGE_API_TOKEN and BRIDGE_DATASET_ID are required for sync');
  }
  return new BridgeClient({
    token: env.BRIDGE_API_TOKEN!,
    datasetId: env.BRIDGE_DATASET_ID!,
  });
}

async function queueHeroMirror(payload: Payload, listingId: number | string): Promise<void> {
  await payload.jobs.queue({
    task: 'mirrorListingHero',
    input: { listingId: String(listingId) },
  });
}

export async function syncBridgeListings(
  payload: Payload,
  input: SyncBridgeInput,
): Promise<{ syncLogId: number | string; status: 'success' | 'warning' | 'error' }> {
  const started = Date.now();
  const runAt = new Date().toISOString();
  const reconcile = shouldReconcile(input.full, input.trigger);
  const client = createBridgeClient();

  const areasQuery = await payload.find({
    collection: 'areas',
    where: {
      and: [
        { syncEnabled: { equals: true } },
        ...(input.areaSlug ? [{ slug: { equals: input.areaSlug } }] : []),
      ],
    },
    limit: 100,
    depth: 0,
  });

  const areaResults: AreaSyncResult[] = [];

  for (const area of areasQuery.docs) {
    const result: AreaSyncResult = {
      area: typeof area.id === 'number' ? area.id : Number(area.id),
      areaSlug: area.slug,
      fetched: 0,
      created: 0,
      updated: 0,
      deactivated: 0,
      warnings: [],
      errors: [],
      heroJobsQueued: 0,
    };

    try {
      const modifiedSince =
        !reconcile && area.lastSyncedAt
          ? typeof area.lastSyncedAt === 'string'
            ? area.lastSyncedAt
            : new Date(area.lastSyncedAt).toISOString()
          : undefined;

      const records = await client.fetchActiveListingsForArea(area.mlsAreaMajor, {
        modifiedSince,
      });
      result.fetched = records.length;

      if (records.length === 0) {
        // An incremental fetch legitimately returns nothing when no listing changed
        // since lastSyncedAt. Only warn if the area is truly empty in the feed.
        try {
          const remoteActive = await client.countActiveListingsForArea(area.mlsAreaMajor);
          if (remoteActive === 0) {
            result.warnings.push({
              item: `Zero listings for mlsAreaMajor=${JSON.stringify(area.mlsAreaMajor)} — check the match string.`,
            });
          } else {
            payload.logger.info({
              area: area.slug,
              remoteActive,
              msg: 'No modified listings since last sync',
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          result.warnings.push({
            item: `Zero listings fetched for mlsAreaMajor=${JSON.stringify(area.mlsAreaMajor)}; could not verify remote active count: ${message}`,
          });
        }
      }

      const seenKeys = new Set<string>();
      const syncedAt = new Date().toISOString();

      for (const record of records) {
        try {
          const mapped = mapBridgePropertyToListing(record);
          seenKeys.add(mapped.listingKey);

          const existing = await payload.find({
            collection: 'listings',
            where: { listingKey: { equals: mapped.listingKey } },
            limit: 1,
            depth: 0,
          });

          // Partial update: mapped fields + area/syncedAt/isActive only.
          // Editorial fields such as `broker` are deliberately omitted so a
          // manually-set listing broker override survives repeated syncs.
          const data = {
            ...mapped,
            area: area.id,
            syncedAt,
            isActive: true,
          };

          const previous = existing.docs[0];
          let listingId: number | string;

          if (previous) {
            await payload.update({
              collection: 'listings',
              id: previous.id,
              data,
              overrideAccess: true,
              context: SYNC_CONTEXT,
            });
            listingId = previous.id;
            result.updated += 1;
          } else {
            const created = await payload.create({
              collection: 'listings',
              data,
              overrideAccess: true,
              context: SYNC_CONTEXT,
            });
            listingId = created.id;
            result.created += 1;
          }

          const nextHeroKey = mapped.gallery?.[0]?.mediaKey;
          const needsHeroMirror =
            Boolean(nextHeroKey) && (!previous?.heroImage || previous.heroMediaKey !== nextHeroKey);

          if (needsHeroMirror) {
            await queueHeroMirror(payload, listingId);
            result.heroJobsQueued += 1;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          result.errors.push({ item: message });
          payload.logger.error({ err: error, msg: 'Failed to upsert Bridge listing' });
        }
      }

      if (reconcile) {
        // Full active set for this area — deactivate anything missing from the feed
        const activeInArea = await payload.find({
          collection: 'listings',
          where: {
            and: [{ area: { equals: area.id } }, { isActive: { equals: true } }],
          },
          limit: 5000,
          depth: 0,
          pagination: false,
        });

        for (const listing of activeInArea.docs) {
          if (!seenKeys.has(listing.listingKey)) {
            await payload.update({
              collection: 'listings',
              id: listing.id,
              data: {
                isActive: false,
                mlsStatus: 'sold',
              },
              overrideAccess: true,
              context: SYNC_CONTEXT,
            });
            result.deactivated += 1;
          }
        }
      }

      await computeAndWriteAreaStats(payload, area.id, SYNC_CONTEXT);
      await payload.update({
        collection: 'areas',
        id: area.id,
        data: { lastSyncedAt: syncedAt },
        overrideAccess: true,
        context: SYNC_CONTEXT,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push({ item: message });
      payload.logger.error({ err: error, area: area.slug, msg: 'Area sync failed' });
    }

    areaResults.push(result);
  }

  const hasErrors = areaResults.some((r) => r.errors.length > 0);
  const hasWarnings = areaResults.some((r) => r.warnings.length > 0);
  const status: 'success' | 'warning' | 'error' = hasErrors
    ? 'error'
    : hasWarnings
      ? 'warning'
      : 'success';

  const warningSummary = areaResults
    .flatMap((r) => r.warnings.map((w) => `${r.areaSlug}: ${w.item}`))
    .slice(0, 5)
    .join(' | ');

  const syncLog = await payload.create({
    collection: 'sync-logs',
    data: {
      runAt,
      trigger: input.trigger,
      durationMs: Date.now() - started,
      status,
      message: warningSummary || undefined,
      areas: areaResults.map((r) => ({
        area: r.area,
        areaSlug: r.areaSlug,
        fetched: r.fetched,
        created: r.created,
        updated: r.updated,
        deactivated: r.deactivated,
        warnings: r.warnings,
        errors: r.errors,
      })),
    },
    overrideAccess: true,
  });

  const touched = areaResults.some((r) => r.created + r.updated + r.deactivated > 0);
  if (touched) {
    await revalidateWebTags(payload, [
      CMS_CACHE_TAGS.listings,
      CMS_CACHE_TAGS.listingsFeatured,
      CMS_CACHE_TAGS.areas,
    ]);
  }

  return { syncLogId: syncLog.id, status };
}

export const syncBridgeListingsTask = {
  slug: 'syncBridgeListings',
  label: 'Sync Bridge listings',
  inputSchema: [
    {
      name: 'trigger',
      type: 'select',
      required: true,
      options: [
        { label: 'Cron', value: 'cron' },
        { label: 'Manual', value: 'manual' },
      ],
      defaultValue: 'cron',
    },
    { name: 'areaSlug', type: 'text' },
    { name: 'full', type: 'checkbox', defaultValue: false },
  ],
  outputSchema: [
    { name: 'syncLogId', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
    },
  ],
  schedule: [
    {
      cron: env.BRIDGE_SYNC_CRON,
      queue: 'bridge',
    },
  ],
  retries: 1,
  handler: async ({ input, req }) => {
    const typed = input as SyncBridgeInput;
    const result = await syncBridgeListings(req.payload, {
      trigger: typed.trigger ?? 'cron',
      areaSlug: typeof typed.areaSlug === 'string' ? typed.areaSlug : undefined,
      full: Boolean(typed.full),
    });
    // Hero jobs land on the default queue; autoRun drains them.
    return {
      output: {
        syncLogId: String(result.syncLogId),
        status: result.status,
      },
    };
  },
} as TaskConfig;

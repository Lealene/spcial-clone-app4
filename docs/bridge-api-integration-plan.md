# Bridge Data Output (MLS) Integration — Phase 1

## Context

The site currently runs entirely on hand-authored static data (`apps/web/src/data/`). Listings, communities, floorplan "models", ratings and reviews are all invented — `property.ts` even generates room dimensions from formulas. We need real MLS listings from Bridge Data Output, stored in Payload, kept fresh by a scheduled worker.

**This phase is backend-only.** It builds the ingest pipeline and verifies it in the Payload admin. The frontend keeps reading static data and does not visibly change — with one exception: the fabricated "models" section is removed from community pages. Swapping the frontend onto Payload data is Phase 2, deliberately deferred until we've seen real data and confirmed the field mapping.

**Areas to sync** — 3 communities (get detail pages) and 2 cities (feed `/listings` only). `fort-myers` deferred for now (large + `contains` over-matches adjacent areas).

| Slug | Kind | Detail page | County | `mlsAreaMajor` (NABOR) |
|---|---|---|---|---|
| `bonita-bay` | community | ✅ | Lee | `BONITA BAY` |
| `valencia-bonita` | community | ✅ | Lee | `VALENCIA BONITA` |
| `valencia-trails` | community | ✅ | Collier (Naples) | `VALENCIA TRAILS` |
| `bonita-springs` | city | ✗ | Lee | `BONITA SPRINGS` |
| `fort-myers-beach` | city | ✗ | Lee | `FORT MYERS BEACH` |

**API filter** — one query per area: `MLSAreaMajor eq '{match}' AND MlsStatus eq 'Active'`. NABOR match strings are **uppercase** and case-sensitive. Prefer `eq` over `contains` — `contains('FORT MYERS')` also hits North Fort Myers / Fort Myers Beach. Because `MLSAreaMajor` is a single scalar per listing, areas never double-count. Note this means the Bonita Springs area is *not* a superset of Bonita Bay and Valencia Bonita.

---

## Decisions locked

| Decision | Choice | Rationale |
|---|---|---|
| Area model | One `areas` collection, `kind: community\|city` | One sync loop, one admin list; adding Naples later is one row |
| Write conflicts | Sync writes a field **only** when the API returns a value | Author-entered values survive nightly syncs |
| Admin editability | All fields editable by admins | Per your call |
| Photos | Hero mirrored to R2; gallery hotlinked, schema ready for full mirror | ~3 GB vs ~250 GB; upgrade is a flag + backfill |
| Storage | Cloudflare R2 via `@payloadcms/storage-s3` | No egress fees; reached over R2's S3-compatible API since the backend runs on Node (Railway), not Workers |
| Listing slug | `{street}-{city}-fl-{mlsId}` | SEO keywords + guaranteed unique |
| Status | Real MLS statuses + optional authored `badge` | Builder vocabulary doesn't fit resale MLS data |
| Property type | RESO subtypes + `isEstate` tier flag | "Estate" is a marketing tier, not an MLS field |
| Delisted listings | Keep page, mark inactive, hide from grids | Preserves SEO equity and inbound links |
| PDP floorplan | Keep section, author-only, hides when empty | No MLS source; not fabricated either |
| Reviews | Author in Payload as real testimonials | No MLS source; currently fabricated |
| Community stats | Computed from synced listings each run | Always accurate, zero upkeep |
| Sync cadence | Full backfill → daily incremental → weekly reconcile | A city may be thousands of listings |
| Sync observability | `syncLogs` collection in admin | No external alerting |

**Accepted tradeoff:** because the sync skips null API values, a value the MLS *genuinely clears* won't propagate — it persists until cleared manually.

---

## Phase 0 — Probe the API first

Throwaway script at `scripts/probe-bridge.ts`, deleted after use. Makes ~3 calls and prints:

1. **Distinct `MLSAreaMajor` values** → the exact match strings to store on each area. Guessing here is the single biggest risk in the plan; a wrong string silently returns zero listings.
2. **Active listing count per area** → firms up storage/duration math.
3. **One complete listing, every field** → which RESO fields your MLS actually populates (`TaxAnnualAmount` and `AssociationFee` are commonly empty).
4. **One listing's `Media` array** → photo URL shape and count.

Everything downstream is designed against this output rather than the RESO spec.

---

## Phase 1 — Foundations

### 1a. Env vars — `apps/backend/src/env.ts`

```
BRIDGE_API_TOKEN        required for sync (optional for local CMS boot)
BRIDGE_DATASET_ID       required for sync
BRIDGE_SYNC_CRON        optional, default '0 3 * * *'
BRIDGE_SYNC_SECRET      required for manual sync endpoint (Phase 4)
S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY / S3_ENDPOINT
S3_REGION               optional, default 'auto'
S3_PUBLIC_URL           optional — bucket public origin (custom domain / r2.dev)
```

S3 plugin enables only when bucket + keys + endpoint are all set.

Cron timezone: `America/New_York`. Payload registers crons at init, so the schedule is env-driven — changing it is an env update plus restart.

### 1b. Cloudflare R2 storage

Install `@payloadcms/storage-s3`, register the plugin in `payload.config.ts` pointed at the `media` collection, with `endpoint` = `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, `region: 'auto'`, and path-style addressing as R2 requires. **Do not use `@payloadcms/storage-r2`** — that adapter takes a live Workers `R2Bucket` binding (`env.MY_BUCKET`), not access-key credentials, and is built for Cloudflare Workers / OpenNext (+ Miniflare in dev). This backend is Payload-in-Next on Railway (plain Node + Postgres); nothing injects an `R2Bucket`.

**Public reads:** R2 ignores object ACLs, so do **not** rely on `acl: 'public-read'`. Enable bucket-level public access (custom domain or `r2.dev`) and put that public origin in `images.remotePatterns`.

**Prerequisite** — `Media` is currently `upload: true` with no adapter, i.e. ephemeral local disk. Mirroring anything requires this first.

### 1c. `Areas` collection — `apps/backend/src/collections/Areas.ts`

- **Identity:** `slug` (unique), `name`, `kind` (`community` | `city`), `city`, `county`
- **Sync control:** `mlsAreaMajor` (match string), `syncEnabled` (bool), `lastSyncedAt`
- **Editorial** (communities only, mirrors `CommunityDetail`): `blurb`, `gallery`, `about` (rich text), `amenities` (array), `clubs`, `faqs`, `phone`
- **Reviews:** removed. `rating`, `reviewCount`, `reviewBars` and `reviews` were authored fields, dropped by the `drop_area_reviews` migration. Broker ratings are unaffected.
- **Computed stats** (written by sync, read-only intent): `activeCount`, `priceMin`, `priceMax`, `avgPricePerSqft`, `bedsMin/Max`, `sqftMin/Max`, `hoaMin/Max`, `yearBuiltMin/Max`, `is55Plus`, `isGated`

Seed the 5 rows via a script. Frontend does not read this yet.

---

## Phase 2 — Listings collection

`apps/backend/src/collections/Listings.ts`

**MLS-owned:** `listingKey` (unique, indexed), `mlsId` (indexed), `slug` (unique, indexed), `area` (relationship → areas, indexed), `fullAddress`, `streetAddress`, `city`, `state`, `zip`, `price`, `beds`, `baths`, `sqft`, `pricePerSqft`, `propertyType`, `mlsStatus`, `features[]`, `yearBuilt`, `lotSqft`, `taxesYearly`, `hoaMonthly`, `publicRemarks`, `listAgentName`, `listOfficeName`, `interiorSpecs`, `exteriorSpecs`, `modificationTimestamp`

**Photos:**
```ts
heroImage: relationship → media        // mirrored to R2
gallery: [{
  url:      text,                       // Bridge CDN — always present
  mediaKey: text,                       // change detection
  order:    number,
  media:    relationship → media | null // unused now; full mirror later
}]
```
Frontend always resolves `photo.media?.url ?? photo.url`, so enabling a full mirror is a flag plus a backfill job — no schema or frontend change.

**Author-owned** (sync never writes): `badge`, `isEstate`, `floorPlan` (array of rooms, hides when empty), `neighborhoodBlurb`, `highlights[]`

**Bookkeeping:** `rawData` (json — full RESO record, for debugging and extracting fields later without re-syncing), `syncedAt`, `isActive`

Access: `read` public, writes `authenticated`. Then generate and run the Postgres migration.

---

## Phase 3 — Bridge client + mapper

`apps/backend/src/services/bridge/`

- **`client.ts`** — OData client against `https://api.bridgedataoutput.com/api/v2/OData/{datasetId}/Property`. Bearer auth, `$filter`/`$select`/`$top`. Include `Media` in `$select` (embedded field on NABOR — do **not** `$expand=Media`). Follows `@odata.nextLink`, exponential backoff honoring `Retry-After`.
- **`types.ts`** — RESO Property + Media response types.
- **`mapper.ts`** — pure function, RESO record → listing shape. **Omits keys whose source value is null/undefined** — this is what makes the skip-empty write behavior work.

### Field mapping

| Target | RESO source |
|---|---|
| `listingKey` / `mlsId` | `ListingKey` / `ListingId` |
| `slug` | slugified street + city + `-fl-` + `ListingId` |
| `price` / `beds` / `baths` / `sqft` | `ListPrice` / `BedroomsTotal` / `BathroomsTotalDecimal` / `LivingArea` |
| `propertyType` | `PropertySubType` → mapping table, unknowns → `other` |
| `mlsStatus` | `MlsStatus` → `active\|pending\|under-contract\|sold\|coming-soon` |
| `features[]` | `WaterfrontYN`, `PoolPrivateYN`, `AssociationAmenities` (golf), `CommunityFeatures` (gated), `SeniorCommunityYN` |
| `yearBuilt` / `lotSqft` / `taxesYearly` / `hoaMonthly` | `YearBuilt` / `LotSizeSquareFeet` / `TaxAnnualAmount` / `AssociationFee` |
| `publicRemarks` | `PublicRemarks` |
| `interiorSpecs` | `InteriorFeatures`, `Appliances`, `Flooring`, `Heating`, `Cooling`, `LaundryFeatures` |
| `exteriorSpecs` | `Roof`, `ConstructionMaterials`, `ParkingFeatures`, `PoolFeatures`, `LotFeatures`, `Sewer`, `WaterSource` |
| `listAgentName` / `listOfficeName` | `ListAgentFullName` / `ListOfficeName` |
| `gallery` | `Media[]` → `{ url, mediaKey, order }` |
| `rawData` | full record |

---

## Phase 4 — Sync job, logging, triggers

### 4a. Task — `apps/backend/src/jobs/sync-bridge-listings.ts`

For each `syncEnabled` area:
1. Fetch listings — full backfill if `lastSyncedAt` is unset, else `ModificationTimestamp gt lastSyncedAt`
2. Map each record, then upsert by `listingKey`, **applying only present keys**
3. Queue a hero-image job per new/changed listing (compare `mediaKey`)
4. Recompute the area's stats from its listings
5. **Weekly reconcile** (Sundays, or when forced): full fetch, then any listing not in the returned set gets `isActive: false`, `mlsStatus: 'sold'` — page stays live, drops out of grids

### 4b. Hero image job — `apps/backend/src/jobs/mirror-listing-hero.ts`

Separate queued, resumable job: downloads `gallery[0].url`, uploads to Media (R2), sets `heroImage`. Skips when `mediaKey` is unchanged. Built reusable so the same function can walk the full gallery later.

### 4c. `SyncLogs` collection

Per run: `runAt`, `trigger` (`cron` | `manual`), `durationMs`, `status`, and per-area `{ area, fetched, created, updated, deactivated, errors[] }`. **An area returning zero listings is recorded as a warning** — that's the signature of a wrong `mlsAreaMajor` string, which is the failure mode most likely to go unnoticed.

### 4d. Triggers

- Registered in `payload.config.ts` under `jobs`, `crons: true`, schedule from `BRIDGE_SYNC_CRON`
- `POST /api/bridge/sync` — accepts an authenticated admin session **or** `Bearer $BRIDGE_SYNC_SECRET`; optional `areaSlug` and `full` params
- Admin UI buttons: "Sync all areas" (global) and "Sync this area" (on an area doc)

---

## Phase 5 — Frontend

### 5a. Remove the models section

`apps/web/src/components/communities/main-content.tsx` — delete the `<section id="models">` block (~115–170). Drop the now-unused `Floorplan` import, the `#models` nav/anchor entry, and `CommunityModel` types/data in `community-detail.ts` if unreferenced.

### 5b. Image remote patterns

Add the Bridge photo CDN and the R2 **bucket public origin** (custom domain or `*.r2.dev` — not an S3 ACL) to `images.remotePatterns` in `apps/web/next.config.ts`.

**Not in this phase:** static data stays authoritative. `seaside-cove`, `coral-lagoon`, `mangrove-bay` remain untouched.

---

## Deferred to Phase 2

Swap `/listings` and community pages onto Payload; add shared listing schemas to `@mvp-realty/api-contracts`; update filter UI for the new status/type vocabulary; retire static data and decide the fate of the three fictional communities.

---

## Verification

1. **Probe** — run `scripts/probe-bridge.ts`, confirm real `MLSAreaMajor` strings and per-area counts before writing the schema
2. **Unit tests** — `mapper.test.ts` against a saved probe fixture; assert null API values produce *omitted* keys, not nulls. `client.test.ts` for pagination and backoff with mocked fetch
3. **Migration** — run it, confirm `areas`, `listings`, `syncLogs` in `/admin`
4. **Single-area sync** — trigger Bonita Bay via the admin button. Verify in `/admin`: listing count matches the probe, prices/beds/baths/address correct against the MLS site, hero images present in R2, gallery URLs resolve, area stats computed
5. **Skip-empty behavior** — hand-enter an `hoaMonthly` on a listing where the API returns null, re-sync, confirm the value survives
6. **Incremental** — re-run immediately; `syncLogs` should show near-zero fetched
7. **Reconcile** — force a full run, confirm a listing absent from the feed flips to inactive, its page still renders, and it's gone from grids
8. **Cron** — confirm the scheduled run fires and writes a `syncLogs` entry
9. **Frontend** — `pnpm typecheck && pnpm lint && pnpm test`, then confirm community pages render without the models section and nothing else regressed

---

## Files

**Modify:** `apps/backend/src/env.ts` · `apps/backend/src/payload.config.ts` · `apps/web/src/components/communities/main-content.tsx` · `apps/web/next.config.ts` · `apps/backend/package.json`

**Create:** `scripts/probe-bridge.ts` (throwaway) · `apps/backend/src/collections/{Areas,Listings,SyncLogs}.ts` · `apps/backend/src/services/bridge/{client,types,mapper}.ts` · `apps/backend/src/jobs/{sync-bridge-listings,mirror-listing-hero}.ts` · `apps/backend/src/endpoints/bridge-sync.ts` · `apps/backend/src/scripts/seed-areas.ts`

---

## Decision log

Rationale for every choice above — what was chosen, what was rejected, and why — plus the codebase findings that reshaped this plan and the four items still genuinely unknown:

→ [`docs/decisions/bridge-api-integration.md`](./decisions/bridge-api-integration.md)

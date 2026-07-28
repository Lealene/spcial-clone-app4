# Decision log — Bridge Data Output (MLS) integration

Companion to [`../bridge-api-integration-plan.md`](../bridge-api-integration-plan.md).

Records **why** the design is the way it is — what was chosen, what was rejected, and the reasoning — so a future reader (human or agent) doesn't relitigate settled questions or "fix" something that was deliberate.

Decided 2026-07-29 via a structured design interview. Two decisions are marked ⚠️ because they are easy to break by accident: see **D4** and **D13**.

## Findings that reshaped the plan

These were discovered while reading the codebase, and each one invalidated part of the original draft.

| # | Finding | Consequence |
|---|---|---|
| F1 | The 6 requested areas are **3 cities + 3 subdivisions**, not 6 peer communities. Bonita Bay and Valencia Bonita sit *inside* Bonita Springs; Valencia Trails is in Naples (Collier), which isn't in the list at all. | Forced the `kind` field and the "communities get pages, cities don't" split. |
| F2 | A nightly sync writing `null` over author-entered values would **silently erase them every night**. | Drove the skip-empty write rule (D4) — the single most important behavioral decision here. |
| F3 | `Media` is `upload: true` with **no storage adapter installed** (no S3/R2 in `package.json`). On Railway that's ephemeral local disk. | Made object storage a hard prerequisite for mirroring any photo, not an implementation detail. |
| F4 | Full photo mirroring is ≈133,000 files / ≈250 GB (25–50 photos × ~3,800 listings, before sharp variants). | Reframed the photo decision entirely; led to hero-only (D13). |
| F5 | `ListingStatus` (`now-selling`/`move-in`/`new-model`) is **builder inventory vocabulary**. MLS speaks transactional status. `Pending` has no honest home in the existing enum. | Replaced the enum rather than mapping onto it (D16). |
| F6 | `estate` is not an MLS field — it's a marketing price tier. | Split into real `propertyType` + `isEstate` flag (D17). |
| F7 | The **reviews section is as fabricated as the models section** — `rating: 4.8`, `reviews: 57`, review bars and cards all invented, with no MLS source. | Surfaced a second fake-data section the original request hadn't noticed (D2). |
| F8 | Existing listing slugs are marketing names (`the-anchorage`, `lakeside-villa`). Real MLS listings have addresses, not names. | The slug scheme had to be redesigned from scratch (D10). |
| F9 | RESO is a ~2,000-field **menu, not a contract**. Each MLS chooses what to populate. `MLSAreaMajor` may be `"Bonita Bay"`, `"BN04 - Bonita Bay"`, or `"BN04"`. | A wrong filter string returns **zero results with no error**. Drove both Phase 0 and the zero-results warning (D19). |
| F10 | Payload registers cron schedules **at init**, so a runtime-editable cron expression isn't achievable. | Schedule lives in an env var; only per-area `syncEnabled` toggles are runtime-editable. |

## Decisions

### D1 — Areas as one collection with a `kind` field
**Chose:** single `areas` collection, `kind: community | city`, where `kind` decides whether a detail page is generated.
**Rejected:** separate `Cities` + `Communities` collections (two sync loops, two admin lists, and Valencia Trails would need a Naples city record that otherwise has no purpose); cities in a TS config file (no reason to split storage when the shape is identical).
**Why:** one sync loop, one admin list, and adding Naples or Estero later is a single row. The city/community distinction is presentational, so it belongs in a field rather than in the schema shape.

### D2 — Reviews authored in Payload
**Chose:** real testimonials as authored content per area.
**Rejected:** removing the section (loses social proof that the design leans on); Google Places API (a second integration, and Google's ToS restrict caching and display).
**Why:** the section has design value; the problem was fabricated data, not the section existing.

### D3 — Community stats computed from MLS
**Chose:** price range, active count, sqft/beds/HOA ranges recomputed from that area's listings on every sync.
**Rejected:** manual entry (goes stale, duplicates what the MLS already knows); manual-with-computed-fallback (two sources of truth to reason about).
**Why:** always accurate, zero editorial upkeep. These are exactly the numbers a nightly job is good at.

### D4 — Sync writes a field only when the API returns a value ⚠️
**Chose:** the mapper **omits keys** whose RESO source is null/undefined, so the upsert leaves existing Payload values untouched.
**Rejected:** MLS-field + author-override pairs (cleanest and never loses data, but doubles ~6 fields and adds a resolver everywhere); per-field lock flags (authors must remember to lock, and generates "why isn't this updating?" confusion).
**Why:** simplest schema that satisfies "author fills the gaps and their work survives."
**Known cost — accepted deliberately:** a value the MLS *genuinely clears* never propagates; it persists until cleared by hand. And where the MLS *does* have a value, it overwrites an author edit on the next run.
**Implementation note:** this behavior lives entirely in the mapper omitting keys. A well-meaning refactor that makes the mapper return `null` for missing fields instead of omitting them **silently breaks this guarantee** and reintroduces F2. Test #5 in Verification exists specifically to catch that.

### D5 — All fields admin-editable
**Chose:** no `admin.readOnly` on sync-owned fields.
**Rejected:** read-only MLS fields (prevents wasted effort and is closer to IDX norms, which discourage altering MLS facts); admin-only editability.
**Why:** user preference for maximum flexibility. Note the consequence: an edit to a field the MLS populates *will* be overwritten on the next sync, and nothing in the UI warns about that.

### D6 — PDP floorplan kept, author-only
**Chose:** keep the section, populated only by authors, hidden when empty.
**Rejected:** removing it like the models section; substituting MLS room counts.
**Why:** MLS has no room-dimension data (RESO's `Rooms` resource exists but Bridge feeds rarely populate it). Keeping it author-only preserves the option without fabricating anything. Expect most listings to leave it blank.

### D7 — Delisted listings keep their page
**Chose:** flip `isActive: false` and `mlsStatus: 'sold'`; page stays live with a "no longer available" state plus similar homes; removed from all grids.
**Rejected:** 301 to the area page (visitor loses the context of what they clicked); hard 404 / record deletion (discards SEO equity and dead-ends every old link).
**Why:** listing URLs accumulate backlinks and search traffic. A sold listing is still a lead-capture surface.
**Watch:** many IDX agreements require *deleting mirrored photos* when a listing goes off-market — relevant once D13 is upgraded to a full mirror.

### D8/D9 — Areas in Payload, not a config file
**Chose:** Payload collection holding both editorial content and the `mlsAreaMajor` match string.
**Rejected:** config file for filters + static content (every copy edit or new area needs a deploy); hybrid split.
**Why:** non-developers can add an area and edit copy without a release. Keeping the filter string beside the content it governs avoids a second place to look.

### D10 — Slug = address + MLS number
**Chose:** `{street}-{city}-fl-{mlsId}`.
**Rejected:** address only (condo units collide, and addresses get reused across years — needs `-2`/`-3` suffix logic and a uniqueness check); MLS number only (zero SEO value, unreadable when shared).
**Why:** keyword-rich for local search, deterministic from API data alone, and the MLS-number suffix makes collisions structurally impossible — no lookup needed at write time.

### D11 — Fictional communities stay static this phase
**Chose:** leave `seaside-cove`, `coral-lagoon`, `mangrove-bay` untouched.
**Rejected:** deleting them now; migrating them as sync-less Payload areas.
**Why:** they're entangled with static listings and routes. Deferring keeps Phase 1 backend-only and risk-free. **This is unfinished business for Phase 2**, not a permanent state — once real data lands, these pages would show zero listings.

### D12 — Backend first, frontend untouched
**Chose:** ship collections + sync, verify entirely in `/admin`. Frontend keeps static data; only the models section is removed.
**Rejected:** swapping `/listings` immediately (grids and community pages would disagree during the interim); one full-swap pass (largest single change, no checkpoint).
**Why:** the field mapping is the riskiest part and it's cheap to verify in the admin UI before any user-facing surface depends on it.

### D13 — Hero image mirrored, gallery hotlinked ⚠️
**Chose:** mirror the primary photo per listing (~3,800 files, ~3 GB). Gallery stores Bridge CDN URLs plus an **unused optional `media` relationship**.
**Rejected:** full mirror (≈250 GB, hours-long backfill, and IDX license exposure — this was the initial preference, revised after F3/F4 were quantified); hotlink everything (breaks OG/social previews, which is the strongest single argument for mirroring anything).
**Why:** captures the wins that matter — `next/image` optimization on cards, working social previews on shared listing links — at ~1% of the storage.
**Reversibility is the point:** because the `media` relationship already exists on gallery entries and the frontend always resolves `photo.media?.url ?? photo.url`, upgrading to a full mirror is a flag plus a backfill job reusing the same download function. **No schema change, no migration, no frontend change.** Build the image job queued and resumable from the start so this stays true.

### D14 — Cloudflare R2 via `@payloadcms/storage-s3` (not `storage-r2`)
**Chose:** R2 reached through `@payloadcms/storage-s3` (endpoint + access key + secret, `region: 'auto'`).
**Rejected:** AWS S3 (egress fees compound badly on an image-heavy property site); Railway volume (not a CDN — images would serve from the app container); `@payloadcms/storage-r2` (exists at our Payload version, but `R2StorageOptions.bucket` is a live Workers `R2Bucket` binding with `.put()/.get()/.head()`, not credentials — only usable on Cloudflare Workers / OpenNext / Miniflare, which collides with this Railway + Postgres Node backend).
**Why:** zero egress; R2's S3-compatible API is the correct access path from Node; free tier covers the hero-only footprint.
**Implementation note:** R2 ignores object ACLs — public hero URLs need bucket-level public access (custom domain or `r2.dev`), not `acl: 'public-read'`.

### D15 — Observability: `syncLogs` collection only
**Chose:** per-run records in Payload, inspectable in admin.
**Rejected:** Sentry integration (`SENTRY_DSN` is already an available env var here, so this remains easy to add later).
**Why:** user preference. **Consequence worth stating plainly:** nothing actively notifies anyone. A sync that fails for a week is only discovered by someone opening `/admin`. The zero-results warning (D19) is therefore doing real work — it makes the most likely silent failure visible in the place someone actually looks.

### D16 — Real MLS statuses + optional authored badge
**Chose:** `mlsStatus` (`active | pending | under-contract | sold | coming-soon`) drives filters; a separate optional authored `badge` carries marketing labels.
**Rejected:** mapping MLS values into the existing builder enum (lossy — `Pending` has nowhere honest to go, and calling a resale home "now selling" is misleading); maintaining both a true and a derived status.
**Why:** these are general MLS listings, mostly resale, not builder inventory. Buyers expect transactional status. Marketing language survives in `badge` where it's genuinely wanted.
**Phase 2 impact:** the `/listings` filter UI needs updating for the new vocabulary.

### D17 — RESO subtypes + `isEstate` tier
**Chose:** honest `propertyType` from `PropertySubType`, plus a separate `isEstate` flag (authored or price-derived).
**Rejected:** forcing everything into the existing 4 values (townhouses and multi-family have nowhere accurate to land); dropping `estate` entirely (loses a marketing tier that has real value here).
**Why:** separates what the MLS knows from what the brand asserts.

### D18 — Probe the API before finalizing the schema
**Chose:** throwaway script first, deleted after use.
**Rejected:** building from the RESO spec and correcting after the first sync.
**Why:** F9. Credentials already exist, so this costs ~10 minutes and converts the plan's riskiest guesses — exact `MLSAreaMajor` strings, real per-area counts, which fields are actually populated — into facts. The alternative is a schema rewrite plus a throwaway migration.

### D19 — Manual trigger: admin button + secured endpoint
**Chose:** "Sync all areas" and per-area "Sync this area" buttons in admin, backed by `POST /api/bridge/sync` accepting an admin session **or** `Bearer $BRIDGE_SYNC_SECRET`.
**Rejected:** endpoint only (not self-serve for non-developers); CLI script only (needs shell access).
**Why:** editors can re-sync after fixing a bad `mlsAreaMajor` string without developer help — the most likely reason anyone needs a manual run. The bearer secret keeps CI and curl workable.

## Probe findings (2026-07-29, dataset `nabor`)

Settled from Phase 0 against live Bridge:

1. **Match strings are uppercase display names**, not codes — e.g. `BONITA BAY`, `VALENCIA TRAILS`. Title case (`Bonita Bay`) returns zero on Active filters; `contains` is case-sensitive.
2. **Prefer `MLSAreaMajor eq` over `contains`.** `contains('FORT MYERS')` over-matches North Fort Myers and Fort Myers Beach.
3. **Active counts (`eq`):** Bonita Bay 108 · Valencia Bonita 18 · Valencia Trails 23 · Bonita Springs 43 · Fort Myers Beach 16. (Fort Myers city was ~254 `eq` / ~456 `contains` — deferred.) Total in-scope ≈ **208** active listings.
4. **City field is also uppercase** (`NAPLES`, `BONITA SPRINGS`). City-eq volumes are much larger than MLSAreaMajor-eq for the same name (e.g. City Bonita Springs ≈1450 vs MLSAreaMajor 43) — confirming the plan’s “not a superset” note.
5. **Photos:** `Media` is an **embedded complex field** on `Property`, not an OData navigation. `$expand=Media` returns 400 (`Invalid field in $expand`). Use `$select=…,Media` (or omit `$select`). Sample Bonita Bay listing had `PhotosCount: 19`; CDN origin `https://dvvjkgh94f2v6.cloudfront.net`. Media keys: `MediaKey`, `MediaURL`, `Order`, `MimeType`, `MediaCategory`, `MediaObjectID`, `ShortDescription`.
6. **Field population (Bonita Bay sample):** populated — price/beds/baths/sqft, address parts, `PropertySubType`, amenities/community features, year built, lot sqft, public remarks, interior/appliances/flooring/HVAC, parking/pool features, agent/office. **Empty** — `TaxAnnualAmount`, `AssociationFee` (+ frequency), `LaundryFeatures`, `Roof`, `ConstructionMaterials`, `LotFeatures`, `Sewer`, `WaterSource`. So D4 (skip-empty) will matter immediately for taxes/HOA.

## Scope change — Fort Myers deferred

**Chose (2026-07-29):** drop `fort-myers` from the Phase 1 seed set for now; keep `fort-myers-beach` and the three communities + Bonita Springs.
**Why:** size + filter ambiguity with adjacent area names; can add later as one `areas` row once the pipeline is proven.
**Still in scope:** 5 areas (3 communities + 2 cities).

## Still genuinely unknown

Carried forward deliberately rather than guessed at:

1. ~~**Per-area listing counts.**~~ Settled above for the five in-scope areas.
2. **IDX license terms on storing photos.** Hero-only is low exposure, but the "retain / store / copy / cache" language in the Bridge agreement and the MLS's IDX addendum governs whether D13 can ever be upgraded.
3. ~~**Which RESO fields this MLS populates.**~~ Settled in probe findings #6 — taxes/HOA empty on sample; D4 carries them as author-owned until MLS fills them.
4. ~~**Whether `MLSAreaMajor` values match the area names at all.**~~ Settled — uppercase names, not codes.

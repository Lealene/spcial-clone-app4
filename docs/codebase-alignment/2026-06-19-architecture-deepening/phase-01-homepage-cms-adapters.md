# Phase 01 — Homepage CMS adapters

Status: `implemented`

## 1. Scope

Files/modules involved:

- `apps/web/src/lib/cms/pages/index.ts`
- new `apps/web/src/lib/cms/pages/*` adapter modules
- `apps/web/src/data/homepage-fixture.ts`
- `apps/web/src/lib/cms/media.ts`
- `apps/web/src/lib/cms/links.ts`
- `packages/api-contracts/src/index.ts`

## 2. Current Shape

`apps/web/src/lib/cms/pages/index.ts` is the public homepage CMS module. It currently exposes:

- `getPageContent()`
- `getHeaderContent()`
- `getFooterContent()`

The implementation now separates page transport, Header/Footer normalization, SEO normalization, and per-block adapters. Payload-connected content is authoritative: missing, unavailable, or invalid required CMS content raises an explicit route error instead of returning editorial fixtures.

## 3. Problem

The module is shallow at the implementation level: one file concentrates too many unrelated changes. Adding or changing one CMS page block requires reading the entire normalizer, and bugs in one block’s mapping are not local to that block.

This makes the interface hard to test: the public interface is small, but the implementation has no internal seams for focused block normalization tests.

## 4. Target Shape

Keep the public interface stable, but deepen the implementation:

- `homepage.ts` becomes a facade for homepage page content.
- shared parsing helpers move into `apps/web/src/lib/cms/pages/primitives.ts`.
- each block gets a focused adapter under `apps/web/src/lib/cms/pages/adapters/`.
- a registry maps CMS page block type to adapter.
- unknown blocks continue to be ignored safely.
- failed fetches, missing required homepage content, and empty effective layouts fail clearly; fixtures remain test-only.

## 5. Implementation Notes

Suggested new files:

- `apps/web/src/lib/cms/pages/primitives.ts`
- `apps/web/src/lib/cms/pages/block-adapters.ts`
- `apps/web/src/lib/cms/pages/adapters/hero.ts`
- `apps/web/src/lib/cms/pages/adapters/communities-strip.ts`
- `apps/web/src/lib/cms/pages/adapters/featured-communities.ts`
- `apps/web/src/lib/cms/pages/adapters/featured-residences.ts`
- `apps/web/src/lib/cms/pages/adapters/lifestyle.ts`
- `apps/web/src/lib/cms/pages/adapters/testimonials.ts`
- `apps/web/src/lib/cms/pages/adapters/amenities.ts`
- `apps/web/src/lib/cms/pages/adapters/owner-intro.ts`
- `apps/web/src/lib/cms/pages/adapters/lead-capture.ts`

Reuse existing helpers instead of changing behavior:

- `normalizeMediaField` from `apps/web/src/lib/cms/media.ts`
- `normalizeLink` and `normalizeCta` from `apps/web/src/lib/cms/links.ts`
- representative block data from `apps/web/src/data/homepage-fixture.ts` in tests only
- schemas/types from `@mvp-realty/api-contracts`

## 6. Verification

Run focused tests first:

- `pnpm --filter @mvp-realty/web test`
- `pnpm --filter @mvp-realty/web typecheck`
- `pnpm --filter @mvp-realty/web lint`

Add tests near the new adapter modules to verify:

- every known block type has an adapter;
- representative raw Payload-shaped input normalizes to each contract block;
- unknown block types are dropped;
- missing, unavailable, invalid, or empty required homepage content raises the declared CMS error policy.

## 7. Status

`implemented`

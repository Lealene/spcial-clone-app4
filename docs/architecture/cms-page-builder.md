# CMS page builder architecture

Status: active  
Last updated: 2026-06-19

## Purpose

Payload `Pages` is the reusable page-builder surface for marketing pages. The homepage is not a separate system; it is the `pages` document with `slug: "home"`, rendered at `/` with a fixture fallback when Payload is unavailable.

Editors should be able to create a new `Pages` entry, choose supported CMS page blocks, populate them, sort them, and have the web app render the page at `/<slug>`. Local development can seed the homepage, header, footer, and media with `pnpm -C apps/backend seed:homepage:local`.

## Backend shape

- Payload collection: `apps/backend/src/collections/Pages.ts`.
- Page block configs: `apps/backend/src/blocks/*`.
- Page block registry: `apps/backend/src/blocks/index.ts` exports `pageBlocks`.
- Shared block identity comes from `CMS_PAGE_BLOCK_TYPES` in `@mvp-realty/api-contracts`.
- Reserved top-level slugs are rejected by the collection validation: `admin`, `api`, `listings`, `communities`, and `ui`.
- `home` is reserved by convention for `/`, but remains a valid page slug.
- Local seed script: `apps/backend/src/scripts/seed-homepage.ts` upserts `media`, Header/Footer globals, and the published `home` page using Payload Local API.

Do not hand-edit Payload generated files. Regenerate with `pnpm -C apps/backend generate:types` after schema changes.

## Web shape

- CMS page fetch/normalization lives in `apps/web/src/lib/cms/pages/`.
- `getPageContent(slug)` fetches a Payload page by slug and returns `CmsPage | null`.
- `apps/web/src/app/page.tsx` fetches `getPageContent('home')` and falls back to `homepageFixture` when CMS content is unavailable.
- `apps/web/src/app/[slug]/page.tsx` fetches `getPageContent(slug)` and returns `notFound()` when missing or reserved.
- Metadata is mapped through `apps/web/src/lib/cms/pages/metadata.ts`.

## Block renderer pattern

CMS-renderable React blocks live in `apps/web/src/components/blocks/`.

`apps/web/src/components/blocks/index.ts` is the web block export surface, and `block-renderer.tsx` owns the typed renderer registry. The registry is explicit, not runtime name-matched, so TypeScript catches drift between Payload block identity and React renderers.

```ts
const blockRenderers = {
  hero: Hero,
  communitiesStrip: CommunitiesStrip,
  featuredCommunities: FeaturedCommunities,
  featuredResidences: FeaturedResidences,
  lifestyle: TheLife,
  testimonials: Testimonials,
  amenities: Amenities,
  ownerIntro: MeetTheOwner,
  leadCapture: LeadCapture,
} satisfies Record<CmsPageBlockType, CmsPageBlockRenderer>;
```

When adding a new CMS page block, update these seams together:

1. `packages/api-contracts/src/index.ts` — Zod schema and `CMS_PAGE_BLOCK_TYPES`.
2. `apps/backend/src/blocks/<Block>.ts` — Payload block config.
3. `apps/backend/src/blocks/index.ts` — `pageBlocks` registry.
4. `apps/web/src/lib/cms/pages/adapters/<block>.ts` — raw Payload to contract adapter.
5. `apps/web/src/lib/cms/pages/block-adapters.ts` — adapter registry.
6. `apps/web/src/components/blocks/<block>.tsx` — React renderer.
7. `apps/web/src/components/blocks/block-renderer.tsx` — renderer registry.
8. Tests/fixtures for the new block.

## Fallback policy

- `/` uses the Payload `home` page when it validates and has at least one normalized block.
- `/` falls back to `apps/web/src/data/homepage-fixture.ts` if the backend is unavailable, the `home` page is missing, or normalization yields no blocks.
- Non-home CMS pages do not use the homepage fixture; missing or invalid pages return `notFound()`.
- CMS adapters provide safe text/image defaults for partial editor content so a missing media URL or required copy field does not crash rendering.

## Routing policy

First pass supports single-segment CMS pages only: `/about`, `/sell-with-us`, etc. Nested CMS paths require a later explicit change to Payload slug validation, route matching, and collision handling.

Existing application routes remain first-class and should not be shadowed by CMS pages:

- `/listings`
- `/listings/[slug]`
- `/communities/[slug]`
- `/ui`
- backend/admin/API namespaces

# Phase 02 — CMS page block catalog

Status: `implemented`

## 1. Scope

Files/modules involved:

- `packages/api-contracts/src/index.ts`
- `apps/backend/src/blocks/index.ts`
- `apps/backend/src/blocks/*.ts`
- `apps/web/src/lib/cms/pages/block-adapters.ts`
- `apps/web/src/components/blocks/block-renderer.tsx`

## 2. Current Shape

CMS page block identity is repeated in several places:

- Zod schemas and discriminated union in `@mvp-realty/api-contracts`;
- Payload block `slug` values in `apps/backend/src/blocks/*.ts`;
- backend block registration order in `apps/backend/src/blocks/index.ts`;
- web normalization switch/registry in `apps/web/src/lib/cms/pages/index.ts` or its future adapter registry;
- web rendering switch in `apps/web/src/components/blocks/block-renderer.tsx`.

## 3. Problem

The block list is a shallow seam. A block rename, addition, or removal can drift across contracts, Payload, web normalization, fixtures, and rendering. The current architecture relies on humans remembering every parallel location.

## 4. Target Shape

Create one shared block catalog interface in `@mvp-realty/api-contracts`:

- exported block type constants in canonical order;
- a `CmsPageBlockType` type derived from those constants;
- a schema map that must cover every block type;
- typed records in backend/web modules that must satisfy the catalog.

This should not generate Payload fields or React renderers. The catalog should own identity/order and exhaustiveness only.

## 5. Implementation Notes

In `packages/api-contracts/src/index.ts`, add exports such as:

- `CMS_PAGE_BLOCK_TYPES`
- `cmsPageBlockTypeSchema`
- `CmsPageBlockType`
- `cmsPageBlockSchemasByType`

Then use the shared type in:

- `apps/backend/src/blocks/index.ts` as `Record<CmsPageBlockType, Block>`;
- `apps/web/src/lib/cms/pages/block-adapters.ts` as `Record<CmsPageBlockType, CmsPageBlockAdapter>`;
- `apps/web/src/components/blocks/block-renderer.tsx` as an exhaustive renderer map or typed switch.

If Payload block `slug` values are replaced with shared constants, run Payload type generation afterward.

## 6. Verification

Run:

- `pnpm --filter @mvp-realty/api-contracts test`
- `pnpm --filter @mvp-realty/api-contracts typecheck`
- `pnpm --filter @mvp-realty/backend typecheck`
- `pnpm --filter @mvp-realty/web typecheck`

After Payload block changes:

- `pnpm -C apps/backend generate:types`

Add contract tests that fail when a catalog type lacks a schema.

## 7. Status

`implemented`

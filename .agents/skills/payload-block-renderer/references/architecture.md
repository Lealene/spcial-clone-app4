# Portable architecture

## Contents

- Core invariants
- Layer responsibilities
- Project topology
- Identity and type ownership
- Compatibility and failure policy
- Data evolution

## Core invariants

The CMS owns authoring. The frontend owns presentation. A mapping boundary connects them.

1. Payload fields describe what editors may save.
2. Runtime schemas describe what the frontend will accept from the transport.
3. Mappers translate accepted CMS data into presentation-ready view models.
4. A registry dispatches view models to components.
5. Components render frontend-owned props and never interpret Payload relationships or transport quirks.

This separation prevents CMS schema churn from spreading through the component tree and makes failure behavior testable.

Use an editorial-first default when converting an existing component: move most meaningful content and safe configuration into Payload unless the user explicitly excludes it. Keep technical implementation details in the frontend. Classify every component input; do not infer that every React prop deserves a CMS field.

## Layer responsibilities

### Payload authoring schema

Own:

- Block slug and interface name
- Editor labels, descriptions, conditions, defaults, validation, row limits, and relationship filters
- Reusable field factories for links, media, headings, visibility, and other repeated authoring concepts
- Placement catalogs when different collections allow different blocks
- Root-level block registration plus `blockReferences` when the installed Payload version supports it and repeated configs justify it

Do not own component props, CSS decisions, URL resolution, or frontend fallback copy.

User exclusions are part of the authoring contract. Do not create excluded fields under different names, derive equivalent editor controls elsewhere, or silently move excluded values into another Payload group.

### Generated types

Use Payload-generated types for compile-time awareness inside trusted Payload code. Regenerate them after schema changes. Treat them as artifacts, not hand-maintained contracts and not runtime validators.

Generated relationship fields are commonly unions such as `ID | RelatedDocument`. Narrow them at runtime. A configured depth is a query choice, not a guarantee that every future caller populated the relationship.

### Transport validation

Validate remote JSON or Local API output at the boundary. Reuse the project's installed validation library.

For resilient public pages, validate the page envelope and accept `layout: unknown[]`. Each block adapter then owns its detailed validation. This lets old frontends ignore new CMS blocks while still rendering known siblings.

For transactional or safety-critical content, a strict discriminated union may be appropriate. Document why partial rendering is unsafe.

### Mapper

Make the mapper pure when possible. It should:

- Narrow populated relationships versus IDs
- Normalize media and links
- Convert nullable or legacy CMS fields into intentional UI defaults
- Drop malformed nested rows when the block can remain coherent
- Drop the whole block when its required presentation contract cannot be satisfied
- Return a frontend-owned discriminated view model or `null`

Do not let components repeat these decisions.

### Registry

Keep each block's discriminator, mapper, and renderer in one adapter entry. Derive the supported block list and lookup map from that registry.

The registry is the seam for:

- Disabled block handling
- Unknown discriminator handling
- Per-block validation and mapping
- Stable render keys
- Development diagnostics

Avoid separate mapper and renderer switch statements; they drift independently.

### Components

Components receive render-ready props. Interactive blocks may delegate to a small Client Component, while the route, fetcher, mapper, registry, and static wrapper remain server-compatible.

## Project topology

### Single application

Keep Payload configs and frontend features in distinct folders even when they share one Next.js process:

```text
src/
  payload/blocks/
  payload/collections/
  features/cms-page/contracts/
  features/cms-page/mappers/
  features/cms-page/registry.tsx
  features/cms-page/renderer.tsx
  components/blocks/
```

### Separate CMS and frontend apps

Share only lightweight contracts when useful:

```text
apps/cms/              Payload configs and migrations
apps/web/              fetch, mapping, registry, components
packages/cms-contracts runtime transport schemas and stable identifiers
```

Do not import the Payload runtime config into the browser-facing app merely to reuse a block array. It can pull server-only dependencies into the wrong graph.

## Identity and type ownership

Prefer one stable semantic identifier across the pipeline:

```text
Payload slug `featureGrid`
JSON blockType `featureGrid`
view-model type `featureGrid`
registry key `featureGrid`
```

Use a translation only for an intentional compatibility reason. Keep legacy aliases inside the mapper, not throughout the UI.

If multiple collections share a block identity but author different fields, use placement-specific Payload configs that map into the same view model only when their rendered meaning is genuinely the same.

## Compatibility and failure policy

Distinguish these states:

- Fetch failure: no trustworthy page arrived.
- Invalid envelope: the resource is not the expected page.
- Unknown block: the CMS is ahead of the frontend or stale content remains.
- Invalid known block: the expected block shape is incomplete or malformed.
- Disabled block: an editor intentionally hid it.
- Valid empty layout: an editor intentionally or accidentally published no visible content.

Give each state an explicit route-level or registry-level outcome. Do not collapse all of them into `null` without tests explaining the user-visible result.

## Data evolution

Adding, renaming, or removing a block can affect:

- Payload schema and database migration state
- Generated types and import maps
- Existing drafts and published versions
- Runtime transport schemas
- Mapper compatibility defaults
- Registry entries and components
- Seeds and fixtures
- Preview and cache invalidation

Prefer additive evolution: add new optional fields, map old data with deliberate defaults, migrate published content, then remove legacy support after evidence shows it is unused. A renamed discriminator usually requires a content migration or temporary alias support.

For staggered deployments, use this order:

1. Deploy a frontend that safely ignores unknown blocks and already supports the new block.
2. Deploy the Payload schema that lets editors author the block.
3. Publish content containing the new discriminator.

Test `old CMS + new frontend`, `new CMS + new frontend`, and the oldest frontend allowed by rollback policy against published new-block content. Do not roll back to a renderer that crashes on or misinterprets the new discriminator. Unpublish or migrate the content first when tolerance is not proven.

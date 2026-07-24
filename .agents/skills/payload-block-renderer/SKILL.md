---
name: payload-block-renderer
description: Design, build, audit, or extend portable Payload CMS blocks rendered by a React or Next.js frontend through component-to-field classification, runtime validation, CMS-to-view-model mappers, and a typed component registry. Use for converting existing components into Payload blocks, Payload `Block` configs, `blocks` fields, page-builder layouts, generated Payload types, remote CMS fetches, block renderers, adding a new block end to end, or decoupling storefront components from raw Payload response shapes.
---

# Payload Block Renderer

Build a resilient page-builder pipeline without coupling UI components to Payload documents. Adapt the folder layout and libraries to the host project; preserve the architectural boundaries.

## Load project truth first

1. Read the repository instructions and package manifests.
2. Inspect the installed Payload and frontend versions. For Next.js, read the relevant installed docs under `node_modules/next/dist/docs/` before changing Next.js code.
3. Trace one existing block from Payload config through fetch, validation, mapping, registry, component, route, and tests.
4. Identify whether Payload and the frontend share a process, live in separate apps, or communicate through an API.
5. Preserve local naming, test placement, generated-file rules, and migration workflow.

Use structural code tools when available for symbol flow and impact. Use text search for literal slugs, config keys, and error messages.

## Classify every component input

Before designing the Payload schema, inventory every value that affects the rendered component: props, hardcoded copy, arrays, media, links, labels, visibility flags, safe presentation settings, derived values, and internal behavior.

Create a component-to-field ledger with one disposition for every input:

- `Payload field`: editor-owned copy, media, links, repeatable content, ordering, accessibility labels, visibility, or bounded presentation controls.
- `Payload relationship`: content selected from another collection or global.
- `Mapper-derived`: values computed from CMS data or normalized for the component.
- `Frontend-owned`: callbacks, hooks, state, class names, design tokens, breakpoints, implementation details, security values, and other technical props.
- `Explicitly excluded`: fields the user said not to add to Payload; preserve their existing frontend behavior exactly.

Default to exposing the majority of meaningful editorial content and safe configuration in Payload. Do not chase a numeric percentage and do not expose technical props merely for completeness. User exclusions override the default. Ask only when an ambiguous field would materially change editor control, data modeling, or frontend behavior.

Read [implementation-patterns.md](references/implementation-patterns.md#component-to-field-ledger) for the required ledger shape and classification examples.

## Preserve the five boundaries

Keep this dependency direction:

```text
Payload authoring schema
        ↓ generated types / serialized JSON
Runtime transport validation
        ↓ trusted CMS input
CMS-to-UI mapper
        ↓ frontend-owned view model
Typed block registry
        ↓ component props
React component
```

Apply these rules:

- Treat every API or database result entering the frontend as `unknown`, even when generated Payload types exist.
- Keep generated Payload types generated. Never hand-edit them or use them as runtime validation.
- Map relationships, media, links, rich text, defaults, and legacy shapes before data reaches a component.
- Make leaf components accept frontend-owned props, not Payload collection or block types.
- Keep mapping and rendering registration together so a block cannot be mapped but forgotten by the renderer.
- Preserve CMS order. Skip disabled blocks. Handle unknown and malformed blocks by an explicit policy.
- Keep the page renderer a Server Component by default. Put `use client` only on interactive leaves.

Read [architecture.md](references/architecture.md) before designing or auditing the pipeline. Read [implementation-patterns.md](references/implementation-patterns.md) when writing schemas, adapters, the registry, fetching, or tests.

## Choose the compatibility policy

Prefer resilient per-block handling for public content pages:

- Validate the page envelope.
- Keep `layout` as `unknown[]` at the transport boundary.
- Let each registered adapter validate and map its own block.
- Skip unknown block types so a newer CMS does not crash an older frontend.
- Skip malformed known blocks, record useful diagnostics, and continue rendering valid siblings.

Use strict all-or-nothing validation only when partial rendering would be unsafe or misleading. State the choice in code and tests; do not let accidental parser behavior decide it.

## Implement one vertical slice

When adding or changing a block, complete this slice before starting another:

1. Complete the component-to-field ledger and honor every explicit exclusion.
2. Define the Payload `Block`, reuse shared field factories, and register it in the correct collection or global.
3. Generate the required migration and Payload types using the host project’s commands.
4. Add transport validation for the serialized shape, including relationship ID-versus-object cases.
5. Add the frontend view-model member, mapper, component, and typed registry entry.
6. Test the schema, mapper, registry dispatch, invalid/disabled/unknown behavior, fetch policy, and rendered UI.
7. Verify the real Payload admin authoring flow and the rendered page at relevant viewport sizes.

Do not claim the block is complete after only creating the Payload config or React component.

For separate CMS and frontend deployments, ship tolerance and rendering support in the frontend first, then ship the Payload authoring schema, then publish content using the new discriminator. Before rolling the frontend back, unpublish or migrate blocks it would not understand unless the older renderer is already proven to skip unknown blocks safely.

## Make policies explicit

Decide these before implementation:

| Situation | Recommended public-page behavior |
| --- | --- |
| CMS request fails | Use the route's declared fallback, not an accidental empty page |
| Page envelope is invalid | Log a bounded diagnostic and use the declared fallback |
| Unknown block type | Skip it and preserve valid siblings |
| Known block is malformed | Skip it, report its type and position, preserve valid siblings |
| `enabled === false` | Skip silently |
| Every block is skipped | Apply an explicit empty-page policy |
| Relationship is an ID | Reject, resolve separately, or fetch with sufficient depth; never cast it to an object |

In development or preview mode, prefer louder diagnostics. In production, avoid leaking raw CMS payloads or secrets into logs.

## Protect the frontend boundary

- Resolve relative media URLs against an approved CMS origin.
- Allowlist link protocols and reject protocol-relative URLs where internal paths are expected.
- Preserve `noopener noreferrer` for new-tab links.
- Validate media kind when a field requires an image or video.
- Render rich text through a supported serializer; never inject untrusted HTML casually.
- Bound relationship depth and query size. Fetch only what the mapper needs.
- Keep authenticated or secret-bearing CMS access server-side.
- Add cache and invalidation behavior deliberately for the installed frontend version.

## Audit an existing implementation

Report findings by boundary, not by file count:

1. Authoring: component-to-field ledger, exclusions, block configs, shared fields, collection registration, admin constraints.
2. Transport: query, depth, draft/published state, runtime validation, caching.
3. Mapping: normalization, relationship narrowing, defaults, malformed data policy.
4. Rendering: view-model union, registry exhaustiveness, component isolation, server/client boundary.
5. Evolution: type generation, migrations, tests, preview, revalidation, rollback compatibility.

Separate verified behavior from recommendations. Flag any component that consumes raw Payload data, any unchecked cast across the transport boundary, and any block registered on only one side.

## Definition of done

Require evidence proportional to the change:

- Payload config or schema tests pass.
- The component-to-field ledger classifies every rendered input, and unapproved editorial hardcoding does not remain.
- Generated types and migration state match the schema change.
- Runtime parser tests cover valid and invalid payloads.
- Mapper tests cover IDs versus populated relationships, media, links, disabled blocks, and malformed rows.
- Registry tests prove every supported discriminator maps and renders.
- Focused typecheck, lint, and tests pass.
- The block can be authored in Payload admin and renders correctly in the real frontend.
- Unknown or bad blocks do not take down valid sibling content under the chosen compatibility policy.
- Forward and rollback compatibility are tested when CMS and frontend deploy independently.

Do not force a monorepo package split into a single-app repository. Port the boundaries and contracts, not a particular directory tree.

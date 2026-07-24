# Implementation patterns

## Contents

- Minimal Payload block
- Component-to-field ledger
- Resilient page envelope
- Frontend view models
- Typed adapter registry
- Fetch and render boundary
- Testing matrix
- Common failure modes

Examples use Payload, React, TypeScript, and Zod. Replace Zod or paths with the host project's established equivalents.

## Component-to-field ledger

Build this ledger before writing the block config. Include component props and values hardcoded inside JSX or helper modules.

| Component input | Current source | Disposition | Payload shape or frontend owner | Reason |
| --- | --- | --- | --- | --- |
| Heading and body | JSX literals | Payload field | `heading: text`, `body: textarea` | Editor-owned content |
| Cards and order | Local array | Payload field | `items: array` | Repeatable editorial content |
| Card image | Static import | Payload relationship | `image: upload` | Editor-selectable media |
| CTA destination | Literal path | Payload field | Shared link group | Editor-owned navigation intent |
| Visible/hidden state | Always rendered | Payload field | `enabled: checkbox` | Safe editorial control |
| Grid breakpoint | CSS classes | Frontend-owned | Component styles | Responsive implementation detail |
| Click handler | Component function | Frontend-owned | Client component | Runtime behavior, not content |
| Calculated URL | Several CMS fields | Mapper-derived | Mapper | Avoid duplicate authoring |
| Internal badge | Existing constant | Explicitly excluded | Preserve constant | User requested no CMS field |

Use these classification rules:

- Put copy, media, CTAs, repeatable rows, ordering, accessible labels, and safe visibility/configuration controls in Payload by default.
- Use relationships when editors select canonical documents; do not duplicate related records into blocks without a reason.
- Derive display-ready values in the mapper when editors should not manage redundant data.
- Keep callbacks, state, class names, hooks, breakpoints, design-system tokens, secrets, environment values, and rendering algorithms in code.
- Preserve every user-excluded value in the frontend and record the exclusion in the ledger.

The ledger is complete only when every rendered input has exactly one disposition. “Keep in code” requires a technical, derived, or explicit-exclusion reason; convenience alone is not enough for meaningful editorial content.

## Minimal Payload block

```ts
import type { Block } from 'payload'

export const FeatureGridBlock: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  labels: { singular: 'Feature grid', plural: 'Feature grids' },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    { name: 'heading', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
  ],
}
```

Register the block in the intended `blocks` field. Reuse existing shared field factories instead of cloning link or media definitions.

## Resilient page envelope

```ts
import { z } from 'zod'

export const cmsPageSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    title: z.string(),
    slug: z.string(),
    layout: z.array(z.unknown()).nullish(),
  })
  .passthrough()

export type CmsPage = z.infer<typeof cmsPageSchema>
```

Keeping layout entries unknown is deliberate under a resilient per-block policy. Define detailed schemas next to their adapters or in a transport-contract module.

```ts
const featureGridInputSchema = z
  .object({
    blockType: z.literal('featureGrid'),
    enabled: z.boolean().nullish(),
    heading: z.string(),
    items: z.array(
      z.object({ title: z.string(), body: z.string() }).passthrough(),
    ),
  })
  .passthrough()
```

## Frontend view models

```ts
export type ContentBlockViewModel =
  {
    type: 'featureGrid'
    heading: string
    items: Array<{ title: string; body: string }>
  }
```

Add one union member per supported block. View models should already contain resolved URLs, accessible labels, sanitized rich-text output or ASTs, and component-ready defaults.

## Typed adapter registry

```tsx
import type { ReactNode } from 'react'

type BlockType = ContentBlockViewModel['type']
type ViewModelOf<T extends BlockType> = Extract<ContentBlockViewModel, { type: T }>

type BlockAdapter<T extends BlockType> = {
  blockType: T
  map: (input: unknown) => ViewModelOf<T> | null
  render: (model: ViewModelOf<T>, key: string) => ReactNode
}

type RegistryEntry = {
  blockType: BlockType
  map: (input: unknown) => ContentBlockViewModel | null
  render: (model: ContentBlockViewModel, key: string) => ReactNode
}

function defineBlock<T extends BlockType>(adapter: BlockAdapter<T>): RegistryEntry {
  return {
    blockType: adapter.blockType,
    map: adapter.map,
    render: (model, key) =>
      model.type === adapter.blockType
        ? adapter.render(model as ViewModelOf<T>, key)
        : null,
  }
}

const featureGridAdapter = defineBlock({
  blockType: 'featureGrid',
  map: (input) => {
    const parsed = featureGridInputSchema.safeParse(input)
    if (!parsed.success || parsed.data.enabled === false) return null

    const heading = parsed.data.heading.trim()
    const items = parsed.data.items
      .map((item) => ({ title: item.title.trim(), body: item.body.trim() }))
      .filter((item) => item.title && item.body)

    return heading && items.length ? { type: 'featureGrid', heading, items } : null
  },
  render: (model, key) => <FeatureGrid key={key} {...model} />,
})

const adapters: RegistryEntry[] = [featureGridAdapter]
const adapterByType = new Map(adapters.map((adapter) => [adapter.blockType, adapter]))

export type BlockDiagnostic = {
  kind: 'unknown-block' | 'invalid-block'
  blockType: string | null
  index: number
  issues?: readonly string[]
}

function rawBlockType(input: unknown): string | null {
  if (typeof input !== 'object' || input === null || !('blockType' in input)) return null
  return typeof input.blockType === 'string' ? input.blockType : null
}

export function mapCmsBlock(input: unknown): ContentBlockViewModel | null {
  const blockType = rawBlockType(input)
  return blockType ? (adapterByType.get(blockType)?.map(input) ?? null) : null
}

export function renderCmsBlock(model: ContentBlockViewModel, index: number): ReactNode {
  return adapterByType.get(model.type)?.render(model, `${model.type}-${index}`) ?? null
}
```

The cast stays inside the generic adapter helper after a discriminant check. Do not scatter assertions across block mappers or components.

Map lists through one boundary that can emit bounded diagnostics:

```ts
export function mapCmsBlocks(
  inputs: readonly unknown[],
  onDiagnostic: (diagnostic: BlockDiagnostic) => void = () => {},
): ContentBlockViewModel[] {
  return inputs.flatMap((input, index) => {
    if (
      typeof input === 'object' &&
      input !== null &&
      'enabled' in input &&
      input.enabled === false
    ) {
      return []
    }

    const blockType = rawBlockType(input)
    const adapter = blockType ? adapterByType.get(blockType) : undefined
    if (!adapter) {
      onDiagnostic({ kind: 'unknown-block', blockType, index })
      return []
    }

    const model = adapter.map(input)
    if (model) return [model]
    onDiagnostic({ kind: 'invalid-block', blockType, index })
    return []
  })
}
```

Do not emit a diagnostic for an intentionally disabled block. Either check `enabled === false` before mapping or return a distinct mapper result so invalid and disabled states cannot be confused. Pass parser issue paths only when useful; never log the raw CMS block.

An array registry is ergonomic, but TypeScript does not prove key uniqueness. Add a contract test for unique and complete discriminators. When compile-time exhaustiveness matters more than array ergonomics, define the registry as an object with `satisfies { [K in BlockType]: RegistryEntry & { blockType: K } }`; duplicate keys, missing union members, and key/discriminator mismatches then fail locally.

For frequently reordered blocks, prefer a persistent Payload block or row ID in the render key when available; index is acceptable only when the server-rendered list is stable for that render.

## Fetch and render boundary

```tsx
export async function fetchCmsPage(slug: string): Promise<CmsPage | null> {
  const response = await fetch(buildCmsPageUrl(slug), cmsFetchOptions())
  if (!response.ok) return null

  const payload = await response.json()
  const firstDocument = extractFirstDocument(payload)
  const parsed = cmsPageSchema.safeParse(firstDocument)
  return parsed.success ? parsed.data : null
}

export function CmsBlockList({ blocks }: { blocks: readonly ContentBlockViewModel[] }) {
  return <>{blocks.map(renderCmsBlock)}</>
}
```

Keep URL construction, published-versus-draft state, preview authentication, depth, cache lifetime, and tags inside named fetch helpers. Avoid embedding environment-specific fetch policy in components.

When Payload and Next.js share a server runtime, the Local API can replace HTTP. The same validation and mapping boundaries remain useful because relationship depth, drafts, hooks, and future transport changes still affect shape.

## Testing matrix

### Payload authoring

- The collection exposes the intended ordered block catalog.
- Required fields, row limits, defaults, and relationship filters match the editing contract.
- Placement-specific variants retain the intended slug and only the allowed fields.

### Transport

- Published query uses the intended slug, depth, locale, and draft status.
- Non-2xx, empty results, invalid envelopes, timeouts, and thrown errors follow fallback policy.
- Cache and revalidation options match the installed frontend version.

### Mapper and registry

- Every supported block type appears exactly once.
- Valid input maps to the exact view model and produces a valid React element.
- Disabled, unknown, and malformed blocks follow policy.
- Populated relationships and bare IDs are both tested.
- Unsafe links, missing media, wrong media kinds, nullable fields, and malformed nested rows are tested.
- Valid siblings keep their original order when another block is skipped.

### End to end

- An editor can create, reorder, disable, preview, publish, and remove the block.
- Published content appears without a manual rebuild when the caching contract says it should.
- Desktop and mobile rendering remain usable.
- Existing content created before the change still renders or has a tested migration path.

## Common failure modes

| Failure | Cause | Fix |
| --- | --- | --- |
| Component crashes on `relationship.title` | Relationship arrived as an ID | Narrow the union and adjust depth or resolve it explicitly |
| New block is editable but invisible | Payload catalog changed without a registry entry | Complete the vertical slice and add catalog/registry tests |
| Renderer knows a block the CMS cannot create | Registry changed without authoring registration | Add the Payload config or remove the dead adapter |
| Generated type says data is safe | Compile-time type was mistaken for runtime validation | Parse boundary data from `unknown` |
| One malformed block blanks the page | Whole layout uses strict union parsing unintentionally | Use per-block parsing or explicitly accept strict behavior |
| UI contains CMS-specific null checks everywhere | Raw Payload rows reach components | Centralize normalization in mappers |
| Interactive child forces the whole page client-side | `use client` placed above the registry or route | Move the directive to the smallest interactive leaf |
| Changes appear stale after publish | Cache invalidation was not designed with publishing | Add explicit tags/webhooks/revalidation and test the publish path |

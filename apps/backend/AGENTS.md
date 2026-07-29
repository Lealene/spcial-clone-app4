# `@mvp-realty/backend` agent instructions

Payload admin + REST/GraphQL API mounted inside Next.js. Uses Payload v3 with the Postgres adapter. Local port is fixed at `3002`; admin UI is `/admin`, REST is `/api/<slug>`, and GraphQL is `/api/graphql`.

Root rules in `/AGENTS.md` apply. This file carries Payload and backend-specific conventions.

## Hard rules

- **Use Payload v3 patterns.** If the local `payload` skill is available, load it before touching collections, fields, hooks, access control, transactions, or `payload.config.ts`. Otherwise consult Payload v3 docs and keep changes aligned with this file.
- **Adapter is Postgres**, not Mongo. `@payloadcms/db-postgres` reads from `env.DATABASE_URL`. Do not re-introduce Mongo config from stock templates.
- **Env via `src/env.ts`.** Required vars include `DATABASE_URL`, `PAYLOAD_SECRET`, and `PAYLOAD_PUBLIC_SERVER_URL`. `payload.config.ts` reads `env.X`, never `process.env.X` directly.
- **Collections live in `src/collections/*.ts`.** Keep one collection per file and register collections in `src/payload.config.ts`.
- **Access control belongs on collections.** Use `access: { read, create, update, delete }` per collection so REST, GraphQL, and local API enforce the same rules.
- **Hooks belong on collections or fields.** Do not hide Payload lifecycle behavior in app route handlers.
- **Page blocks follow the renderer standard.** Use `docs/architecture/payload-block-renderer-standard.md` and the global `payload-block-renderer` skill when available. Reuse shared enabled/anchor/link/media fields and keep authoring limits aligned with `@mvp-realty/api-contracts`.
- **CSS side-effect imports are declared.** `src/types/css.d.ts` supports Payload CSS imports; do not remove it.
- **Do not set `turbopack.root` in `next.config.ts`.** Auto-detection through the root lockfile is correct for this monorepo.

## Never edit

Payload and Next generate these files:

- `src/payload-types.ts`
- `src/payload-generated-schema.ts`
- `src/app/(payload)/admin/importMap.js`
- `next-env.d.ts`

Regenerate Payload outputs with `pnpm -C apps/backend generate:types` and `pnpm -C apps/backend generate:importmap`.

## Layout

- `src/payload.config.ts` — Payload config: collections, db adapter, editor, plugins, generated type output.
- `src/collections/` — collection schemas. Stock collections are `Users` and `Media`.
- `src/env.ts` — Zod-validated env using `@t3-oss/env-core`.
- `src/hooks/revalidate.ts` — hooks that invalidate the web app's Next.js Data Cache.
- `src/app/(payload)/` — Payload admin UI and API routes; generated import map lives here.
- `src/app/(frontend)/` — backend-owned SSR pages, currently template-level.
- `src/types/css.d.ts` — CSS module declarations for Payload side-effect imports.
- `src/scripts/` — CLI entrypoints and seed/media helpers, grouped by domain pack:
  - `homepage/` — `seed:local` (homepage + areas), media reconcile/remirror library, cleanup, postconditions
  - `communities/` — `seed:community` (areas + brokers + editorial + remirror when S3 is set)
  - `areas/`, `brokers/` — seed libraries only (invoked by the pipelines above; no standalone npm scripts)
  - `shared/` — seed-asset helpers, media paths, lexical converters, shared remirror CLI
  - root `run-bridge-sync.ts`, `run-remirror-listing-heroes.ts`, `audit-cms-blocks.ts` — job/ops CLIs
- `next.config.ts` — wrapped with `withPayload`, workspace transpilation, image patterns, and browser-to-terminal logging.

## Workflow

- **Schema changes**: update collections, regenerate Payload types, and commit schema plus regenerated types together.
- **Migrations**: use Payload migration commands such as `pnpm -C apps/backend payload migrate:create` and `pnpm -C apps/backend payload migrate`. Do not hand-author Drizzle migrations.
- **Local DB reset**: use `pnpm docker:reset` from the repo root when you intentionally want to wipe local Postgres volumes.
- **Web-visible content**: any collection or global the web app reads needs revalidation hooks from `src/hooks/revalidate.ts`, or edits will not appear until the web app's time-based `revalidate` lapses. Cache tag names are shared through `CMS_CACHE_TAGS` in `@mvp-realty/api-contracts` — never hardcode a tag string on one side.
- **Bulk writers** (sync jobs, batch scripts) pass `context: { disableRevalidate: true }` on each write and call `revalidateWebTags` once at the end, so a run does not fire one request per document.

## Next.js work

Before changing Next.js code, read the relevant installed docs in `node_modules/next/dist/docs/`. Combine those docs with Payload v3 docs for Payload-mounted routes.

Browser console output is forwarded to the dev terminal via `logging.browserToTerminal`. If dev server startup reports another server, inspect `.next/dev/lock` for PID/port/URL before killing anything.

## Gotchas

- `Users` has `auth: true` and backs admin login. Do not remove it. End-user/customer accounts need a separate collection.
- `Media` requires `upload: true`. Local disk is fine for dev. Production (and hero mirroring) uses Cloudflare R2 via `@payloadcms/storage-s3` when `S3_*` env vars are set — not `@payloadcms/storage-r2` (Workers binding only). R2 ignores object ACLs; use bucket-level public access + `S3_PUBLIC_URL`.
- Do not import from `apps/web`. Shared contracts belong in `@mvp-realty/api-contracts`.
- Use `payload.logger` inside hooks and endpoints instead of `console.log`; it carries request context.
- Use Payload transactions for multi-step writes that must succeed or fail atomically.
- Domain collections currently include Areas, Brokers, Listings, and SyncLogs. Seed with `pnpm -C apps/backend seed:local` (homepage + areas) and `seed:community` (areas + brokers + community detail). Remirror seed media with `media:remirror-homepage` / `media:remirror-communities` when R2 bytes need a force rewrite.

# `@mvp-realty/web` agent instructions

Customer-facing Next.js app. App Router + Turbopack + React + Tailwind. Dev server starts at `3003` (`cross-env PORT=3003 next dev`) and increments if busy. It talks to the Payload backend through `NEXT_PUBLIC_BACKEND_URL`, defaulting to `http://localhost:3002`. When Payload Media is served from R2/S3, set `NEXT_PUBLIC_MEDIA_URL` to the same public origin as backend `S3_PUBLIC_URL` (allow-listed in CMS media normalization and `images.remotePatterns`).

Root rules in `/AGENTS.md` apply. This file carries only web-specific conventions.

## Hard rules

- **App Router only.** No Pages Router. New routes go in `src/app/<segment>/page.tsx`, plus `layout.tsx`, `loading.tsx`, and `error.tsx` as needed.
- **Server Components by default.** Add `'use client'` only for browser APIs, state, effects, refs, or event handlers.
- **Env via `src/env.ts`.** Server vars live in `server: { ... }`; client-exposed vars must start with `NEXT_PUBLIC_` and live in `client: { ... }`. Never read `process.env` directly.
- **Workspace deps are source-only.** Import from `@mvp-realty/<pkg>`; Next transpiles them via `transpilePackages` in `next.config.ts`. Do not pre-build packages.
- **Tailwind CSS-first.** Theme tokens live in `@mvp-realty/tailwind-config/theme.css` and app semantic tokens live in `src/app/globals.css`. No `tailwind.config.js`.
- **Path alias `@/*` maps to `./src/*`.** Use `paths`; do not add `baseUrl`.
- **Do not import from `apps/backend`.** Shared schemas and types belong in `@mvp-realty/api-contracts`.
- **Payload blocks follow the renderer standard.** Use the `payload-block-renderer` skill at `.agents/skills/payload-block-renderer/`: validate the envelope with `layout: unknown[]`, isolate each block, never fabricate editorial content, and preserve valid siblings.

## Layout

- `src/app/` — routes and layouts.
- `src/env.ts` — Zod-validated env using `@t3-oss/env-nextjs`.
- `src/app/globals.css` — Tailwind import, shared theme import, shared package `@source`, base rules, and app-only motion primitives.
- `src/components/` — app-specific components, grouped by role:
  - `blocks/` — CMS-renderable page blocks only; registered through `index.ts`/renderer. Private block children (sliders, etc.) live in the feature folder that owns them (`listings/`, `communities/`).
  - `layout/` — page scaffolding and site chrome (`container`, `section-header`, nav, footer, brand).
  - `shared/` — widgets used by more than one feature folder (lightbox, breadcrumb, save/share, reveal, broker avatar).
  - `leads/` — lead-capture form and related compositions.
  - `listings/`, `communities/` — feature compositions for those routes.
  - `ui/` — app-local primitive overrides (e.g. Sand-token `Button`); prefer `@mvp-realty/ui` for shared kit primitives.
- `src/lib/` — app logic. Domain folders include `cms/`, `seo/`, `leads/`, and `listings/` (client-side filter/URL state; distinct from `cms/listings/` fetch+normalize). Cross-domain leaves like `saved-local.ts` may sit at the lib root.
- `src/data/` — typed hardcoded data that mirrors future Payload schemas.
- `next.config.ts` — workspace transpilation, image patterns, dev origins, and browser-to-terminal logging.
- `next-env.d.ts` — generated; never edit.

## Design-port rules

For design work, read `docs/design-port/README.md` before editing web UI.

- The approved design system is fixed to the Sand palette, Manrope typeface, and medium roundness (`--radius: 0.625rem`).
- Do not reintroduce theme, font, radius, or localStorage/query-param customization unless the user explicitly asks for it.
- Components use semantic role tokens such as `bg-primary`, `bg-accent`, `bg-cta`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, and `ring-ring`.
- Do not put raw hex values or palette scale utilities in components.
- Keep generic primitives in `@mvp-realty/ui`; keep marketing/listings/community compositions in this app.
- Use typed data and React state/memo logic; no DOM scraping.
- Keep forms clearly marked when they are stubbed instead of backend-wired.

## Next.js work

Before changing Next.js code, read the relevant installed docs in `node_modules/next/dist/docs/`.

Browser console output is forwarded to the dev terminal via `logging.browserToTerminal`; check server output before opening DevTools. If dev server startup reports another server, inspect `.next/dev/lock` for PID/port/URL before killing anything.

When viewing the dev server over LAN IP or tunnels, ensure the origin is covered by `allowedDevOrigins` in `next.config.ts`; otherwise Next dev resources can fail and hydration can silently break.

## Gotchas

- **Routes own their freshness; the data layer owns tags.** `fetchJson` caches until a tag purge (`revalidate: false`) — Payload `afterChange` hooks call `/api/revalidate`, so tags are the real invalidation. Each route declares its own missed-webhook backstop with `export const revalidate = N`. Do not put a number in `fetchJson` or export `revalidate` from `layout.tsx`: the lowest value across a route's layout and pages wins, and the root layout fetches the header/footer on every route, so either one silently caps the whole app.
- A route's tags must cover **everything it renders**, not just its own collection. `getFooterContent()` renders community links, so it tags `areas` alongside `footer`. Audit tag coverage when a block reads across collections — with long backstops, a gap means stale for a day.
- Use `cache: 'no-store'` for personalized data.
- Prefer Suspense/streaming for content-heavy flows instead of blocking an entire route.
- Listings and community detail pages are Payload-backed via `src/lib/cms/`. Homepage page blocks still mix CMS fetches with fixture fallbacks where noted.

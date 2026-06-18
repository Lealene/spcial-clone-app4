# `@mvp-realty/web` agent instructions

Customer-facing Next.js app. App Router + Turbopack + React + Tailwind. Dev server starts at `3003` (`cross-env PORT=3003 next dev`) and increments if busy. It talks to the Payload backend through `NEXT_PUBLIC_BACKEND_URL`, defaulting to `http://localhost:3002`.

Root rules in `/AGENTS.md` apply. This file carries only web-specific conventions.

## Hard rules

- **App Router only.** No Pages Router. New routes go in `src/app/<segment>/page.tsx`, plus `layout.tsx`, `loading.tsx`, and `error.tsx` as needed.
- **Server Components by default.** Add `'use client'` only for browser APIs, state, effects, refs, or event handlers.
- **Env via `src/env.ts`.** Server vars live in `server: { ... }`; client-exposed vars must start with `NEXT_PUBLIC_` and live in `client: { ... }`. Never read `process.env` directly.
- **Workspace deps are source-only.** Import from `@mvp-realty/<pkg>`; Next transpiles them via `transpilePackages` in `next.config.ts`. Do not pre-build packages.
- **Tailwind CSS-first.** Theme tokens live in `@mvp-realty/tailwind-config/theme.css` and app semantic tokens live in `src/app/globals.css`. No `tailwind.config.js`.
- **Path alias `@/*` maps to `./src/*`.** Use `paths`; do not add `baseUrl`.
- **Do not import from `apps/backend`.** Shared schemas and types belong in `@mvp-realty/api-contracts`.

## Layout

- `src/app/` — routes and layouts.
- `src/env.ts` — Zod-validated env using `@t3-oss/env-nextjs`.
- `src/app/globals.css` — Tailwind import, shared theme import, and app semantic tokens.
- `src/components/` — app-specific components.
- `src/data/` — typed hardcoded data that mirrors future Payload schemas.
- `next.config.ts` — workspace transpilation, image patterns, dev origins, and browser-to-terminal logging.
- `next-env.d.ts` — generated; never edit.

## Design-port rules

For design work, read `docs/design-port-decisions.md` before editing web UI.

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

- Server Component data fetching uses Next cache semantics. Use `cache: 'no-store'` for personalized data; default caching is fine for static content.
- Prefer Suspense/streaming for content-heavy flows instead of blocking an entire route.
- The current product data is local static TS data; do not pretend it is Payload-backed until integration exists.

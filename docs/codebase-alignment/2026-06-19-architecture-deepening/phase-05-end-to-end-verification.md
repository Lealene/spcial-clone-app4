# Phase 05 — End-to-end verification

Status: `implemented`

## 1. Scope

Files/modules involved:

- all files changed by phases 01–04;
- existing dev servers for `apps/web` and `apps/backend`;
- Payload local Postgres via `docker-compose.yml`;
- browser smoke tooling such as Playwright or `next-browser`.

## 2. Current Shape

Recent smoke testing confirmed the app can run locally with:

- web app on `http://localhost:3003`;
- Payload backend/admin on `http://localhost:3002`;
- local Postgres on host port `5435`.

When a local Payload database is empty and no migrations exist, backend smoke may require `DB_PUSH=true` so Payload can create/sync tables in a throwaway local DB.

## 3. Problem

The planned refactors touch shared contracts, backend Payload blocks, web CMS normalization, app shell rendering, and CSS token cascade. Static checks alone will not prove that the app still behaves the same through the browser and Payload surfaces.

## 4. Target Shape

Each phase should be verified through both static checks and runtime smoke. The final verification should observe the real app surface rather than only checking implementation details.

## 5. Implementation Notes

Use existing dev servers if `.next/dev/lock` shows they are running. Otherwise start the app with pnpm commands only.

If Payload has no local user during smoke testing, create a local-only admin through Payload’s first-user flow. Do not write credentials into docs or commit them.

Do not use `pnpm dlx`; it is not pinned.

## 6. Verification

Static checks:

```bash
pnpm --filter @mvp-realty/api-contracts test
pnpm --filter @mvp-realty/web test
pnpm --filter @mvp-realty/backend test
pnpm --filter @mvp-realty/web typecheck
pnpm --filter @mvp-realty/backend typecheck
pnpm --filter @mvp-realty/web lint
pnpm --filter @mvp-realty/backend lint
pnpm typecheck
pnpm lint
pnpm build
pnpm format:check
```

Payload generation after schema/config changes:

```bash
pnpm -C apps/backend generate:types
```

Runtime smoke:

1. Visit `http://localhost:3003` and confirm the homepage renders all blocks in order.
2. Visit `http://localhost:3003/listings` and representative listing/community detail pages.
3. Exercise Header desktop links, mobile menu open/close, mobile nav click-to-close, and scroll shadow.
4. Confirm Footer links render with normalized attributes.
5. Confirm Sand tokens remain active on home, listings, detail pages, and `/ui`.
6. Visit `http://localhost:3002/admin` and confirm Payload admin loads.
7. Confirm Pages layout blocks, Header global, and Footer global still load in Payload.
8. Check these CMS endpoints return 200:
   - `/api/globals/header?depth=2`
   - `/api/globals/footer?depth=2`
   - `/api/pages?where[slug][equals]=home&depth=2&limit=1`
9. Confirm no Payload/Postgres identifier-length error appears in backend logs.

## 7. Status

`implemented`

# Apps agent instructions

Root rules in `/AGENTS.md` apply. This directory contains deployable workspaces.

## Boundaries

- `apps/web` is the customer-facing Next.js app. Read `apps/web/AGENTS.md` before editing it.
- `apps/backend` is the Payload backend/admin/API. Read `apps/backend/AGENTS.md` before editing it.
- Do not import from one app into another.
- Shared schemas and types belong in `@mvp-realty/api-contracts`.
- Shared React primitives belong in `@mvp-realty/ui`; app-specific compositions stay inside the app.

## Commands

Use root scripts for whole-repo checks. Use `pnpm --filter @mvp-realty/<workspace> <script>` or `pnpm -C apps/<app> <script>` for app-scoped work.

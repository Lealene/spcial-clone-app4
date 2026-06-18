# Agent instructions

Canonical instructions for Claude Code, Codex, and other coding agents. `AGENTS.md` files hold the real rules; sibling `CLAUDE.md` files are Claude Code shims that import `@AGENTS.md`. When conventions change, update the nearest `AGENTS.md`, not the shim.

Monorepo: Next.js web app + Payload backend. pnpm workspaces, Turborepo, and TypeScript strict. See `package.json` for pinned versions; `README.md` for human onboarding.

## Hard rules

- **pnpm only.** `engine-strict=true`; npm/yarn invocations fail. Use `pnpm` for everything, `pnpm exec <bin>` for workspace binaries. Do not use `pnpm dlx` in hooks; it fetches latest and breaks pinning.
- **Node 24.** Enforced via `.nvmrc` and `engines`. If you see `ERR_PNPM_UNSUPPORTED_ENGINE`, run `nvm use`.
- **Never read `process.env` directly.** ESLint blocks it outside env/config files. Import validated `env` from the relevant workspace `src/env.ts`.
- **Workspace deps use `workspace:*`.** Internal packages reference each other via `"@mvp-realty/foo": "workspace:*"`. No `npm publish` step.
- **TypeScript uses `verbatimModuleSyntax`.** Import CommonJS packages by named export, not default import.
- **Payload uses Postgres**, not Mongo. The adapter is `@payloadcms/db-postgres`; do not regenerate from a stock Mongo template.
- **Local Postgres maps to host port 5435.** `docker-compose.yml` maps `5435:5432`; production database URLs use their provider's standard endpoint.
- **No Conventional Commits.** Free-form commit messages.

## Never edit these files

Generators own them; edits are overwritten on the next run:

- `**/next-env.d.ts` (Next.js)
- `apps/backend/src/payload-types.ts`
- `apps/backend/src/payload-generated-schema.ts`
- `apps/backend/src/app/(payload)/admin/importMap.js`
- `pnpm-lock.yaml`
- Any `.next/`, `.turbo/`, `dist/`, `coverage/`, `node_modules/`, `.payload/`

To regenerate Payload types: `pnpm -C apps/backend generate:types`. To rebuild the import map: `pnpm -C apps/backend generate:importmap`.

## Commands

Run from the repo root unless a scoped command is clearer.

- `pnpm dev` — boots Docker Postgres, then both runtimes via Turbo.
- `pnpm docker:up` / `pnpm docker:down` / `pnpm docker:reset` — local infra lifecycle; reset wipes volumes.
- `pnpm typecheck` / `pnpm lint` / `pnpm test` / `pnpm format` / `pnpm format:check` — Turbo-cached across workspaces.
- `pnpm build` — production build.
- `pnpm clean` — removes `node_modules`, app caches, and Turbo caches.
- `pnpm --filter @mvp-realty/<workspace> <script>` — run one script in one workspace.
- `pnpm -C <path> <script>` — run by path, useful for Payload commands.

`pnpm test` uses `--passWithNoTests`; add tests close to new code as `*.test.ts`.

## Project structure

- `apps/web/` — customer-facing Next.js app. Dev starts at port `3003` and increments if busy. See `apps/web/AGENTS.md`.
- `apps/backend/` — Payload admin + API mounted in Next.js, fixed local port `3002`. See `apps/backend/AGENTS.md`.
- `packages/*` — shared source-only TypeScript libraries. Apps consume them through Next `transpilePackages`; no package build step is required between changes and app reload.
- `tooling/*` — shared config packages. Edit these to change rules globally.
- `docs/` — PRDs, decisions, and project documentation.
- `design-draft/` and `design-review/` — design reference material, not production app code.
- `scripts/` — project automation and deployment entrypoints.

## Next.js work

Before any Next.js work, read the relevant installed docs in `node_modules/next/dist/docs/`. The installed docs are version-matched and override model training data.

Both apps forward browser console output to the dev terminal via `logging.browserToTerminal`; inspect dev server output before opening DevTools. If a dev server may already be running, read `.next/dev/lock` for the PID/port/URL before starting another one.

## Payload work

For collections, fields, hooks, access control, transactions, or `payload.config.ts`, use the local Payload guidance in `.agents/skills/payload/` when available. If a tool cannot load that skill, follow Payload v3 docs and the backend rules in `apps/backend/AGENTS.md`.

## Workspace boundaries

- Do not import from one app into another. Put shared runtime-safe schemas and types in `@mvp-realty/api-contracts`.
- Put reusable React primitives in `@mvp-realty/ui`; keep app-specific marketing/listings/community components in the app.
- Shared packages are source-only. Do not add prebuild requirements unless the repo convention changes.

## Gotchas

- Payload CSS side-effect imports require declarations in `apps/backend/src/types/css.d.ts`; do not remove that file.
- `baseUrl` is deprecated in this TypeScript setup. Use `paths` without `baseUrl`.
- Workspace `tsconfig.json` files extend `@mvp-realty/typescript-config/*`. If an editor cannot resolve them, use the workspace TypeScript version.
- `create-payload-app` needs a TTY that automated tools cannot allocate. To re-scaffold backend code, use a template copy and re-apply this repo's overrides.
- Do not set `turbopack.root` in `apps/backend/next.config.ts`; auto-detection via the root lockfile is correct.

## Workflow

- Branch from `main` for non-trivial work.
- Lefthook installs on `pnpm install`. Pre-commit formats and ESLint-fixes staged files. Pre-push runs `pnpm typecheck` and `pnpm lint`.
- `git commit --no-verify` is allowed but rare.
- For new features, prefer test-first development when the behavior is clear.
- For non-trivial changes, request a code-review pass before merging.

## Updating agent instructions

- Update the nearest `AGENTS.md` when conventions change.
- Keep every `CLAUDE.md` as a one-line `@AGENTS.md` shim unless Claude-specific behavior is truly required.
- Keep rules concise, concrete, and grounded in current files.
- Avoid duplicating command bodies, version tables, or generated file lists beyond what agents need to act safely.

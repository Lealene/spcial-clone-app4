# Packages agent instructions

Root rules in `/AGENTS.md` apply. Packages are shared source-only TypeScript libraries.

## Hard rules

- Do not add an independent build step unless the repo convention changes.
- Public APIs are controlled by each package's `exports` in `package.json`.
- Internal dependencies use `workspace:*`.
- Do not import from `apps/*`; packages must stay app-agnostic.
- Keep tests near package source as `*.test.ts` when adding behavior.

## Package roles

- `api-contracts` — shared Zod schemas and TypeScript types between apps.
- `ui` — shared React primitives and reusable UI utilities.

# Tooling agent instructions

Root rules in `/AGENTS.md` apply. Tooling packages define shared config for the whole monorepo.

## Hard rules

- Prefer central tooling changes over app/package-local overrides.
- Keep config packages private, ESM, and consumed through workspace dependencies.
- Do not add unpinned fetching behavior such as `pnpm dlx` in hooks.
- If a tooling change affects conventions, update root `AGENTS.md` and relevant docs in the same PR.

## Package roles

- `eslint-config` — shared ESLint flat configs; blocks direct `process.env` reads outside env/config files.
- `prettier-config` — shared Prettier config and Tailwind class sorting.
- `typescript-config` — strict TypeScript presets; `verbatimModuleSyntax` is on.
- `tailwind-config` — shared Tailwind CSS-first theme tokens.
- `vitest-config` — shared Vitest node and React config variants.

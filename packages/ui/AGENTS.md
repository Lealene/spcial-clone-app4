# `@mvp-realty/ui` agent instructions

Root rules in `/AGENTS.md` and package rules in `/packages/AGENTS.md` apply. This package is the shared React component library.

## Hard rules

- Keep components reusable and app-agnostic. App-specific marketing/listings/community components stay in `apps/web`.
- React is a peer dependency; do not bundle a separate React copy.
- Public imports are controlled by `package.json` exports: root barrel plus `./components/*`, `./hooks/*`, and `./lib/*` subpaths.
- Prefer subpath imports when names collide or when a caller should avoid pulling the root barrel.
- Do not import from `apps/*` or `apps/backend`.
- Style primitives so they work with Tailwind and app semantic tokens; do not hard-code app-specific brand decisions.

## shadcn-style components

`components.json` is configured for `new-york`, RSC, TypeScript, and aliases under `@mvp-realty/ui`. Shared primitives belong in `src/components/ui`; utilities belong in `src/lib`; hooks belong in `src/hooks`.

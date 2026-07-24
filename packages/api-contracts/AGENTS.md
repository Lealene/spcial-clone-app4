# `@mvp-realty/api-contracts` agent instructions

Root rules in `/AGENTS.md` and package rules in `/packages/AGENTS.md` apply. This package is the shared contract boundary between apps.

## Hard rules

- Put shared Zod schemas and TypeScript types here when both web and backend need them.
- Do not import from `apps/*`; contracts must stay framework-agnostic and runtime-safe.
- Prefer serializable data shapes that can cross API boundaries cleanly.
- Keep exports intentional through `src/index.ts` and `package.json`.
- Prefer additive contract changes when possible; coordinate breaking changes across all consumers.
- For Payload page composition, own canonical discriminators, normalized render DTOs, and framework-neutral authoring limits here. Raw Payload REST envelope schemas remain web-owned; generated Payload types are not runtime validators. Follow `docs/architecture/payload-block-renderer-standard.md`.

The package is currently intentionally minimal. Add contracts only when there is a real shared boundary to model.

# `@mvp-realty/vitest-config` agent instructions

Root rules in `/AGENTS.md` and tooling rules in `/tooling/AGENTS.md` apply. This package owns shared Vitest config.

## Hard rules

- Keep tests close to code as `*.test.ts` unless a workspace has a stronger local convention.
- Shared config should support root `pnpm test` and workspace-scoped test scripts.
- Preserve `passWithNoTests` behavior unless the repo deliberately changes test policy.

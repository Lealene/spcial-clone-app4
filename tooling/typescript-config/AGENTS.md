# `@mvp-realty/typescript-config` agent instructions

Root rules in `/AGENTS.md` and tooling rules in `/tooling/AGENTS.md` apply. This package owns shared TypeScript presets.

## Hard rules

- Keep TypeScript strict.
- Keep `verbatimModuleSyntax` enabled unless the project convention changes.
- Do not add `baseUrl`; use `paths` in consuming workspaces.
- Prefer shared preset changes here over copy-pasted compiler options in apps/packages.

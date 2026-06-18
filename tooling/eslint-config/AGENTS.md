# `@mvp-realty/eslint-config` agent instructions

Root rules in `/AGENTS.md` and tooling rules in `/tooling/AGENTS.md` apply. This package owns shared ESLint flat configs.

## Hard rules

- Keep direct `process.env` reads restricted outside env/config files unless the project convention changes.
- Prefer shared lint rules here over duplicating workspace-local ESLint config.
- Keep generated/cache directories ignored consistently with root instructions.
- If a lint rule changes project behavior, update root `AGENTS.md` and affected docs.

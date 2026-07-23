# `@mvp-realty/tailwind-config` agent instructions

Root rules in `/AGENTS.md` and tooling rules in `/tooling/AGENTS.md` apply. This package owns shared Tailwind CSS-first tokens.

## Hard rules

- Tailwind config is CSS-first; do not add `tailwind.config.js` unless the repo convention changes.
- The locked Sand semantic roles, shadcn token bridge, medium radius, Manrope font channels, shadows, and shared motion token names live here.
- App CSS should stay thin: imports, shared `@source`, base rules, and app-only keyframes/motion implementations.

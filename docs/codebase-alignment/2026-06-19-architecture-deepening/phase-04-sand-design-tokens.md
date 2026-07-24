# Phase 04 — Sand design tokens

Status: `implemented`

## 1. Scope

Files/modules involved:

- `tooling/tailwind-config/theme.css`
- `tooling/tailwind-config/package.json`
- `tooling/tailwind-config/README.md`
- `tooling/tailwind-config/AGENTS.md`
- `apps/web/src/app/globals.css`
- `apps/web/AGENTS.md`
- `docs/design-port/README.md`
- `packages/ui/src/components/ui/button.tsx`

## 2. Current Shape

The locked Sand design system is implemented primarily in `apps/web/src/app/globals.css`. That file owns:

- Sand semantic role variables;
- shadcn token bridge;
- medium radius;
- Manrope font-channel mapping;
- Tailwind `@theme inline` role utilities;
- shadows and motion token names;
- app base/body rules and keyframes.

`tooling/tailwind-config/theme.css` currently exists as the shared CSS-first token module, but it still contains placeholder brand/typography tokens and does not own the locked Sand semantic system.

## 3. Problem

The approved design system is app-local even though the repo has a shared Tailwind token package. This limits leverage for `@mvp-realty/ui` and future apps, and docs/agent guidance still describe app CSS as the canonical home for semantic tokens.

## 4. Target Shape

Move the locked Sand design-system implementation into `@mvp-realty/tailwind-config`:

- Sand role variables;
- shadcn token bridge;
- fixed medium radius;
- Manrope font-channel mapping;
- Tailwind role utilities;
- shared shadows;
- shared animation token names if they are part of the design system.

Keep `apps/web/src/app/globals.css` thin:

- Tailwind imports;
- `tw-animate-css` import;
- shared theme import;
- `@source` for `packages/ui`;
- app-local base/body rules and keyframes only where they remain app-specific.

## 5. Implementation Notes

Do not reintroduce runtime theme, font, radius, localStorage, or query-param customization.

Do not add `tailwind.config.js`; keep Tailwind CSS-first.

Update docs/instructions that currently say app semantic tokens live only in `apps/web/src/app/globals.css`:

- `apps/web/AGENTS.md`
- `tooling/tailwind-config/AGENTS.md`
- `tooling/tailwind-config/README.md`
- design-port docs if they describe the old location.

## 6. Verification

Run:

- `pnpm --filter @mvp-realty/web typecheck`
- `pnpm --filter @mvp-realty/web lint`
- `pnpm --filter @mvp-realty/web build`
- `pnpm format:check`

Browser smoke:

- homepage still uses Sand palette;
- `/listings` and representative detail pages still use Sand role utilities;
- shared `@mvp-realty/ui` primitives on `/ui` still receive shadcn token values;
- `font-sans` and `font-serif` still resolve to Manrope;
- `--radius` still computes to `0.625rem`;
- no `data-theme`, `data-font`, or `data-radius` behavior returns.

## 7. Status

`implemented`

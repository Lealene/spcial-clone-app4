# Architecture deepening alignment plan

Status: `implemented`  
Created: 2026-06-19

## Overview

This alignment plan captures the architecture-deepening work identified after the Payload-backed homepage CMS foundation, locked Sand design system, Header/Footer CMS globals, and Payload link-field Postgres identifier fix.

The goal is to preserve current runtime behavior while making the codebase easier to change and verify:

- keep the homepage CMS interface stable while splitting block-specific normalization into smaller adapters;
- make CMS page block identity explicit and shared across contracts, Payload blocks, and web renderers;
- centralize CMS link normalization/rendering behavior;
- isolate site chrome browser interactivity from Header/Footer CMS data;
- move locked Sand design tokens into the shared Tailwind CSS-first token module.

## Scope

Primary areas:

- `packages/api-contracts/src/index.ts`
- `apps/backend/src/blocks/*`
- `apps/backend/src/fields/link.ts`
- `apps/web/src/lib/cms/*`
- `apps/web/src/components/blocks/block-renderer.tsx`
- `apps/web/src/components/site-nav.tsx`
- `apps/web/src/components/site-footer.tsx`
- `apps/web/src/app/globals.css`
- `tooling/tailwind-config/theme.css`

Out of scope:

- adding new public product features;
- changing the approved Sand/Manrope/medium-radius visual direction;
- hand-editing generated Payload or Next files;
- adding database migrations by hand.

## Phases

1. [Homepage CMS adapters](./phase-01-homepage-cms-adapters.md) — split the large homepage normalizer into a facade plus per-block adapters.
2. [CMS page block catalog](./phase-02-homepage-block-catalog.md) — make block identity/order a shared catalog seam across contracts, backend, and web.
3. [CMS links and site chrome](./phase-03-cms-links-site-chrome.md) — centralize link behavior and split browser-only nav interactivity from CMS chrome data.
4. [Sand design tokens](./phase-04-sand-design-tokens.md) — move locked Sand role tokens into `@mvp-realty/tailwind-config` and keep web globals thin.
5. [End-to-end verification](./phase-05-end-to-end-verification.md) — run static checks and browser smoke tests after the refactors.

## Current status

All phases are `implemented`. The implementation preserved the public homepage CMS interface while adding adapter/catalog/link/token seams and completed static plus runtime verification.

# Phase 03 — CMS links and site chrome

Status: `implemented`

## 1. Scope

Files/modules involved:

- `apps/backend/src/fields/link.ts`
- `apps/backend/src/fields/cta.ts`
- `apps/backend/src/globals/Header.ts`
- `apps/backend/src/globals/Footer.ts`
- `apps/web/src/lib/cms/links.ts`
- new `apps/web/src/lib/cms/site-chrome.ts`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/site-nav.tsx`
- new `apps/web/src/components/site-nav-interactive.tsx`
- `apps/web/src/components/site-footer.tsx`
- `packages/api-contracts/src/index.ts`

## 2. Current Shape

`apps/web/src/lib/cms/links.ts` normalizes raw CMS link/CTA data into contract links. Header/Footer normalization currently lives with homepage normalization. `SiteNav` is a client module that combines Header data rendering, sticky scroll-shadow behavior, and mobile menu state. `SiteFooter` renders CMS links directly.

The backend `linkField` already has explicit short `dbName` / `enumName` values to avoid Postgres identifier-length errors.

## 3. Problem

CMS link behavior is split across several modules:

- Payload field shape and database naming in the backend;
- raw Payload-to-contract normalization in web CMS code;
- `href`, `aria-label`, `target`, and `rel` rendering details in React modules.

Site chrome also has a shallow interface: browser-only interactivity and CMS Header/Footer rendering are coupled.

## 4. Target Shape

Deepen CMS links into one web module interface:

- normalize raw links/CTAs;
- detect whether a link or CTA has a usable target;
- produce safe plain render attributes for callers.

Move site chrome data into `apps/web/src/lib/cms/site-chrome.ts`:

- `normalizeHeader`
- `normalizeFooter`
- `getHeaderContent`
- `getFooterContent`

Split nav browser behavior into a small client adapter while preserving the exported `SiteNav` interface.

## 5. Implementation Notes

Extend `apps/web/src/lib/cms/links.ts` with helpers such as:

- `hasLinkTarget(raw)`
- `hasCtaTarget(raw)`
- `getLinkRenderProps(link, fallbackAriaLabel?)`

`getLinkRenderProps` should remain React-agnostic and return plain props:

- `href`
- optional `aria-label`
- optional `target="_blank"`
- optional `rel="noopener noreferrer"`

Update:

- `apps/web/src/components/site-nav.tsx`
- `apps/web/src/components/site-footer.tsx`
- homepage block components only where they duplicate link render behavior.

Keep `apps/backend/src/fields/link.ts` database naming intact.

## 6. Verification

Run:

- `pnpm --filter @mvp-realty/web test`
- `pnpm --filter @mvp-realty/web typecheck`
- `pnpm --filter @mvp-realty/web lint`
- `pnpm --filter @mvp-realty/backend typecheck`

Add tests for:

- internal page links, including home page mapping to `/`;
- custom URLs;
- anchors;
- phone links;
- email links;
- fallback labels/hrefs;
- `newTab` target/rel behavior;
- aria-label override/fallback behavior.

Runtime smoke:

- desktop Header links render and navigate;
- mobile menu opens and closes;
- clicking a mobile nav item closes the menu;
- Footer links render with normalized attributes;
- Header/Footer CMS endpoints return 200.

## 7. Status

`implemented`

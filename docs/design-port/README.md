# Design-draft → `apps/web` port — locked decisions

Status: **all four pages ported (2026-06-09); client-approved design system locked to Sand + Manrope + medium radius.** Home, PLP (`/listings`), PDP (`/listings/[slug]`), and community (`/communities/[slug]`) are in `apps/web`. This document is the source of truth for the web design port; update it in the same PR if a design decision changes.

Goal: keep the `design-draft/` direction expressed as a **full Tailwind 4 + shadcn rewrite** in the Next.js `apps/web` app. The temporary design-exploration customizer has been removed after client approval.

## Source material

- `design-draft/index.html` — home (10 sections). Original rendered design used `l-*` overrides = navy / ivory / gold ("Elegant Concierge").
- `design-draft/listings.html` — listings index / PLP (filter+sort engine, client-side over `data-*`).
- `design-draft/property.html` — single property / PDP (gallery uses `assets/communities/bonita-bay/` set).
- `design-draft/community.html` — community page.
- `design-draft/assets/tokens.css` — historical shared tokens; kept as reference, not copied directly.
- `design-draft/tweaks-panel.jsx` + React/Babel CDN — design-review tooling; do not port.
- Keep `design-draft/` in the repo as the visual-QA reference (do not delete).

## Approved design system

- **Palette:** Sand, mapped once in `tooling/tailwind-config/theme.css` and imported by `apps/web/src/app/globals.css`.
  - `--surface: #faf6f0`
  - `--surface-muted: #f4ede4`
  - `--surface-soft: #fbf8f1`
  - `--primary: #11355c`
  - `--primary-deep: #0c2540`
  - `--accent: #3cb6b3`
  - `--accent-deep: #2a9c99`
  - `--accent-soft: #c2eeed`
  - `--cta: #5fd3d0`
  - `--ink: #1b2b3a`
  - `--ink-soft: #3a4d63`
  - `--muted: #6a7a8c`
  - `--line: #e6dccb`
  - `--line-soft: #efe7d9`
  - `--ring: #2a9c99`
- **Typeface:** Manrope only, loaded through `next/font/google` in `apps/web/src/app/layout.tsx`. Both Tailwind `font-sans` and `font-serif` resolve to Manrope so existing display/headline classes keep working without reintroducing a serif face.
- **Roundness:** medium only (`--radius: 0.625rem`). The `rounded-sm/md/lg/xl` Tailwind scale derives from that single value; `rounded-full` stays full.
- **Mode:** light-only. No dark mode.

## Color & theming spine

- **Semantic role tokens only in components.** Components use role utilities: `bg-primary`, `bg-accent`, `bg-cta`, `bg-surface`, `bg-surface-muted`, `text-ink`, `text-ink-soft`, `text-muted`, `border-line`, `ring-ring`. **No hex and no palette scales (`ocean-600`, etc.) in any component.** Palette values live only in `@mvp-realty/tailwind-config/theme.css`.
- **shadcn semantic tokens** (`--primary`, `--accent`, `--ring`, `--background`, `--foreground`, …) are wired to the same role variables so shadcn components inherit the approved Sand design.
- **No runtime customization.** The former floating "Customize" switcher, `data-theme`/`data-font`/`data-radius` attributes, query-param support, and localStorage persistence were temporary client-showcase tooling and have been removed. Do not reintroduce theme/font/radius customization unless the user explicitly asks for it.

## Structure

- **Routes (dynamic from day one):** `/` (home), `/listings` (PLP), `/listings/[slug]` (PDP), `/communities/[slug]`.
- **Data:** hardcoded **typed TS modules** in `apps/web/src/data/`, shaped to mirror a future Payload schema. `[slug]` pages look up from these. Backend currently has only `Users` + `Media` collections — **no backend wiring in this work**; swap to Payload fetches later behind the same types.
- **Fonts:** Manrope via `next/font/google` as `--font-manrope`. Do not add alternate display/body faces unless the design direction changes.
- **Components:** shadcn primitives (from `@mvp-realty/ui`) for form controls (Input, NativeSelect, Checkbox, Slider, ToggleGroup for beds/baths) + a `Button` with cva variants bound to **role tokens** (`cta`/`primary`/`outline`/`glass`). Hero/sections/nav/footer/cards = bespoke Tailwind. App-specific components in `apps/web/src/components`; generic primitives stay in `@mvp-realty/ui`. Nav + Footer in root `apps/web/src/app/layout.tsx` (all web pages are marketing).
- **Interactivity:** idiomatic React. Filter/sort derives from the typed data array via `useState` + `useMemo` (**no DOM scraping**). Carousel / favorites / nav-shadow as small `'use client'` components. Reveal-on-scroll via a tiny hook or pure CSS. Sections stay Server Components; only interactive leaves are client.
- **Assets:** copy referenced photos to `apps/web/public/images/…`, **slugified filenames** (no spaces), served via `next/image` (width/height or fill).
- **Forms:** lead-capture (home) + request-info (PDP) — markup + client validation; submit hits a **stub** that fakes success + shows a confirmation state, marked `// TODO: wire backend`.

## Page inventories (all 4 pages)

Section list per page, from the `data-screen-label` markers in `design-draft/*.html`. Use these as the build checklist for each slice. **Nav + Footer are shared** (already built in `layout.tsx`) — don't rebuild per page.

### Home (`/`) — `index.html` — ✅ BUILT

Hero · Communities strip · Featured Communities · Featured Residences · The Life (lifestyle) · Testimonials (carousel) · Amenities · Meet the Owner · Lead Capture. (Implemented in `apps/web/src/components/blocks/*`.)

### PLP — listings index (`/listings`) — `listings.html` — ✅ BUILT (decisions in "Resolved — PLP" below)

Implemented: `apps/web/src/app/listings/page.tsx`; data `apps/web/src/data/listings.ts` (15 entries) + `Listing` type in `data/types.ts`; pure logic `apps/web/src/lib/listing-filters.ts` (+ 22 passing unit tests) and URL bridge `lib/use-listing-filters.ts`; components in `apps/web/src/components/listings/` (`listings-hero`, `hero-search`, `quick-filter-bar`, `filter-panel`, `active-filter-chips`, `listing-card`, `listings-browser`, `concierge-cta`). `Container` forwards HTML attrs (e.g. `id`). `ListingCard` is the reusable tile for PDP "Similar Homes" / community "Homes for Sale".

- **Hero** (`s-hero`) — compact page hero/heading.
- **Quick filters bar** (`s-quickbar`) — keyword + sort, sticky.
- **Filter sidebar** (`aside.s-aside`): Price Range (min/max `<select>`: No min/$500k/$750k/$1M/$1.5M/$2M), Bedrooms + Bathrooms (segmented `Any/2+/3+/4+`), Property Type (estate/single-family/villa/condo, with tally counts), Community (bonita-bay/valencia-bonita/valencia-trails/seaside-cove/coral-lagoon/mangrove-bay), Status (now-selling/move-in/new-model), Features (waterfront/pool/golf/gated/55plus). Checkboxes with tally badges.
- **Results grid** of listing cards + **active-filter chips** (removable) + **sort select** (price asc/desc, beds desc, sqft desc) + **empty state**.
- **Concierge CTA** (`s-cta`).
- Listing card data shape (drives filter/sort): `price, beds, baths, sqft, type, community, status, features[], name, slug`. Filter/sort must derive from the typed data array in React (no DOM scraping) per the spine rule.

### PDP — property detail (`/listings/[slug]`) — `property.html` — ✅ BUILT ("as-is", 2026-06-09)

Dynamic route `apps/web/src/app/listings/[slug]/page.tsx` (`generateStaticParams` + `notFound`). Derivation `apps/web/src/data/property.ts` → `getPropertyView(slug)` combines the `Listing` with derived/templated PDP fields (pricePerSqft, deterministic address/year/lot/taxes/hoa/mls via a hash — no randomness; 5-image gallery; similar = same-community→same-type, max 3). Components `apps/web/src/components/listings/property-*.tsx` (gallery, header, actions, body, aside+tour-form, community band, similar). CMS featured-residence cards deep-link here.

- **Breadcrumb** · **Gallery** (multi-image, from `assets/communities/<community>/` sets) · **Title & Key Facts** (status, price + $/sqft, address, fact tiles: beds/baths/sqft/etc.).
- Body sections: **Overview · Interior · Floor Plan · Exterior · Location · Listing Courtesy.**
- **Agent & Tour sidebar** (`aside.p-aside`, sticky) with **Tour request form** (stub submit).
- **Community Key Facts** · **Similar Homes** (related listings).

### Community (`/communities/[slug]`) — `community.html` — ✅ BUILT ("as-is", 2026-06-09)

Dynamic route `apps/web/src/app/communities/[slug]/page.tsx` over all 6 community slugs (`generateStaticParams` + `notFound`). Content `apps/web/src/data/community-detail.ts` → `getCommunityDetail(slug)` (`CommunityDetail`: prose, 6 facts, amenities, clubs, 2 models, review score+bars+cards, FAQs, gallery, similar-nearby). Components `apps/web/src/components/communities/*` (detail-header, header-actions, stars, gallery, section-tabs w/ IntersectionObserver scrollspy, main-content, amenity-icon, floorplan, agent-aside, similar-communities, tour-band). Homes-for-Sale rail reuses `ListingCard` over `listings.filter(community===slug)`; "See all" → `/listings?community=slug`. CMS community cards deep-link here.

- **Header** · **Gallery** · **Tabbed nav** (`c-tabs`, anchors to blocks).
- Blocks: **Overview · Homes for Sale · Models · Amenities · Lifestyle · Reviews · FAQs.**
- **Agent sidebar** (sticky) · **Similar Nearby** communities · **Request a Tour** section.

## Resolved — PLP `/listings` (grilled 2026-06-09)

1. **Filter state = URL search params**, not local state. URL is the single source of truth; `sort` and the hero `q` (keyword) live in the URL too. Shareable concierge links, back-button, refresh-safe. Results still derive via `useMemo` over the typed array (no DOM scraping). Param schema: `q`, `min`, `max`, `beds`, `baths`, `type`, `community`, `status`, `features` (array facets comma-joined, e.g. `type=estate,villa`), `sort` (omitted when `featured`). Writes use `router.replace(url, { scroll: false })`.
2. **Results = show-all** (no pagination). Catalog is small (~15); the draft's `#pager` was decorative — drop it. Pure `useMemo`. Revisit `?page=` later if the Payload dataset grows (URL state already makes it trivial).
3. **Mobile filters = slide-in Sheet** (off-canvas, dim backdrop, scroll-lock, sticky "Show N results" footer button), not the draft's inline expand. Uses `@mvp-realty/ui` `Sheet`. Quick-filter pills row stays visible as the lightweight mobile affordance.
4. **Default sort = "Featured"** = the hand-authored array order (curated first impression). `?sort=featured` is the absent/default param.
5. **Tally badges = live + contextual.** Each facet option's count = listings matching all *other* active filters that also carry that option (standard faceted search). Options that would yield 0 are greyed/disabled. Computed in-memory (cheap `useMemo`). No static counts.
6. **Active-filter chips = port draft 1:1.** One removable chip per active constraint (keyword, min/max price, beds, baths, each checked type/community/status/feature) + "Clear all". Each chip removes only its own URL param.
7. **Empty state = draft's** (icon + "No residences match these filters" + "Clear all filters") **plus** a secondary "Request My Shortlist" concierge CTA. Copy: *"No residences match these filters. Adjust your search or let a concierge hand-pick a shortlist for you."*
8. **Hero search bar = keep, simplified** — keyword + beds, writing the same URL params, scroll-to-results on submit.
9. **Quick-filter pills = keep** as toggles bound to the same feature/status params (draft's `QUICK_MAP`); visually in-sync with the sidebar checkboxes; primary mobile filter affordance.
10. **Favorite hearts = cut for now** (imply saved-listings/accounts that don't exist; a heart that forgets on refresh feels broken). Revisit with backend + auth.
11. **Data = author `apps/web/src/data/listings.ts`** — ~15 typed `Listing` entries spread across the 6 communities / 4 types / 3 statuses / 5 features so every facet has matches. Superset includes the home's featured slugs (`the-anchorage`, `lakeside-villa`, `the-lagoon-model`) so PDP `[slug]` lookups resolve. Shaped to mirror a future Payload `Listings` collection.

**Implementation note:** sidebar controls (price selects, segmented beds/baths, facet checkboxes, sort) are **bespoke Tailwind on role tokens** for fidelity to the draft (navy filled boxes, tally badges) — `@mvp-realty/ui` primitives are used where they carry real behavior (`Sheet` for the mobile drawer). The filter/sort/tally/serialize logic lives in a pure, unit-tested module `apps/web/src/lib/listing-filters.ts`.

## PDP/community — built "as-is", these UX questions deferred (not yet grilled)

PDP and community were ported faithfully from the draft at the user's request **without** grilling. The draft's structure dictated the choices already shipped (PDP gallery = click-to-swap mosaic, no lightbox; community tabs = in-page anchors with scrollspy; Homes-for-Sale = embedded `ListingCard` rail; FAQ = native `<details>` accordion; location = stylized non-interactive map). Revisit these as refinements if desired:

- **PDP:** real lightbox/keyboard gallery? mobile sticky contact bar (draft had one; omitted)? real map embed? richer per-listing copy vs the current templated/derived prose.
- **Community:** routed tabs vs anchors? real per-community amenity/model/review data vs the current authored content; a `/communities` index page (doesn't exist yet — "Explore all communities" currently points at `/listings`).

## Fidelity bar

Tailwind rewrite will not be pixel-identical to the hand-tuned CSS (exact `clamp()` curves, the hero's layered gradient veil, letter-spacing). Match closely against `design-draft/*.html` side-by-side. Flag any element that must be pixel-exact.

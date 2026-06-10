# Design-draft → `apps/web` port — locked decisions

Status: **all four pages ported (2026-06-09).** Home + PLP (`/listings`) grilled & built; PDP (`/listings/[slug]`) + community (`/communities/[slug]`) ported "as-is" from the draft at the user's request (no grill — see note below). All verified across themes. Source of truth for the port; update in the same PR if any decision changes.

Goal: port `design-draft/` (static HTML, "Direction L — Elegant Concierge") into the Next.js `apps/web` app as a **full Tailwind 4 + shadcn rewrite** (not a raw-CSS copy). This is still **design exploration**, not a client-final build.

## Source material

- `design-draft/index.html` — home (10 sections). The rendered design uses the `l-*` overrides = **navy / ivory / gold** ("Elegant Concierge").
- `design-draft/listings.html` — listings index / PLP (filter+sort engine, client-side over `data-*`).
- `design-draft/property.html` — single property / PDP (gallery uses `assets/communities/bonita-bay/` set).
- `design-draft/community.html` — community page.
- `design-draft/assets/tokens.css` — shared tokens; defines a separate **aqua/ocean** palette + Google-font `@import` (Playfair, Cormorant, Lora, Manrope).
- `design-draft/tweaks-panel.jsx` + React/Babel CDN — **design-review tooling, drop it.**
- Keep `design-draft/` in the repo as the visual-QA reference (do not delete).

## Color & theming (the spine — build first)

- **Semantic role tokens ONLY in components.** Components use role utilities: `bg-primary`, `bg-accent`, `bg-cta`, `bg-surface`, `bg-surface-muted`, `text-ink`, `text-ink-soft`, `text-muted`, `border-line`, `ring-ring`. **No hex and no palette scales (`ocean-600`, etc.) in any component** — that breaks theme switching. Palette scales live only inside theme definitions.
- **Themes = CSS-variable blocks** keyed by `[data-theme="…"]` on `<html>`; each theme maps the semantic roles → concrete palette values.
- **shadcn semantic tokens** (`--primary`, `--accent`, `--ring`, `--background`, `--foreground`, …) are wired to the same role variables so shadcn components re-theme automatically.
- **Light-only.** No dark mode.
- **Design switcher ("Customize")** — floating `'use client'` widget (`components/theme-switcher.tsx`) with three knobs the client can play with: **Palette** (`data-theme`), **Typeface** (`data-font`), **Corners** (`data-radius`). Each persists to `localStorage` and honors a `?theme=`/`?font=`/`?radius=` query param (shareable/screenshot links); one pre-paint inline script (`designFoucScript` in `lib/themes.ts`) applies all three before paint to avoid FOUC. **Temporary client-showcase tool** — once the client locks a direction, delete the switcher, the extra `[data-font]`/`[data-radius]` blocks + unused fonts, and collapse to the chosen values.
  - **Typeface** — `data-font` remaps `--ui-serif` (heading/display slot) + `--ui-sans` (body), which the `@theme` `--font-serif`/`--font-sans` tokens reference. 6 pairings, preloaded via `next/font` in `layout.tsx`. Per client feedback the original serif stays as default and the alternates are **premium sans** (not thin serifs): `playfair` (Playfair · Manrope, default), `montserrat` (Montserrat · Manrope), `roboto` (Roboto), `poppins` (Poppins · Manrope), `jakarta` (Plus Jakarta Sans), `outfit` (Outfit · Manrope). Most keep Manrope as the body so only the heading face changes.
  - **Corners** — `data-radius` overrides `--radius`; the `rounded-sm/md/lg/xl` scale derives from it (`rounded-full` stays full). 5 presets: `none` 0 · `sm` 4px · `md` 10px (default) · `lg` 16px · `full` 28px.

### Seeded themes (11)

The switcher (`apps/web/src/lib/themes.ts` + matching `[data-theme]` blocks in `globals.css`) now carries 11 palettes. The first four are the originals; the rest are coastal palettes the client supplied later (2026-06-09), each mapped onto the role tokens (deep shade → primary/ink, hero color → accent/cta, lightest → surfaces). All light-only.

| key | mood | notes |
|---|---|---|
| `concierge` | navy / ivory / gold | **default**, from the `l-*` design |
| `coastal` | saturated aqua / ocean | from `tokens.css` |
| `sand` | warm boutique | sand + seafoam + deep ocean ink |
| `shoreline` | soft pastel coastal | from client reference image; **fully muted / low-contrast** per client request |
| `seaglass` | breezy sea-glass · teal | `#CFE9E6 #7EC7C2 #2F8F9D #F2E8D5 #0E3A4A` — navy ink, sea-glass-green CTA |
| `harbor` | moody maritime · tan | `#0B1D2A #1F4E5F #4C7C8A #C9D6D2 #D9B08C` — harbor-navy primary, steel-teal CTA, warm-tan accent |
| `saltair` | minimal · muted aqua | `#F7FAF9 #D9E5E3 #A7C4C2 #5E8C8A #2B4A4B` |
| `pebble` | cool · slate blue-green | `#EEF2F3 #BFC9CA #7AA3A8 #2D6A7A #1B2A2F` |
| `dune` | warm neutral · driftwood | `#F5F0E6 #DCC9B6 #BFA38A #7E8B8C #2E3A3B` |
| `tidepool` | soft pastel · seafoam | `#E6F7F8 #B8E1DD #A9C7E8 #F6C1C8 #F3E6B3` — pastel-only, primary/ink derived; blush CTA |
| `lighthouse` | classic nautical · brick | `#F4F1EA #D8C9A3 #C04B3A #1E3A5F #0D141C` — navy primary, brick-red accent + CTA |

Skipped the blog's loud/non-coastal picks (Surfboard Retro, Coral Reef Accent, Boardwalk Sunset) as off-brand for luxury realty — easy to add later if wanted.

`shoreline` swatches (from client image): blush `#E9C4B9`, sandy beige `#E2CDA8`, cream `#F1E9D1`, warm greige `#D9D4BD`, soft mint `#BAD8CE`, deeper teal `#91C5BD`, sky blue `#BDD3DD`, heading periwinkle `#6E81C9`. Pastel-only → no native dark tone; client chose the **fully soft / muted** treatment (mostly outline/ghost buttons, muted slate-teal text on cream). **Likely fails WCAG AA for body text — accepted for exploration.** Build it as airy as possible while keeping body copy minimally readable; contrast is a one-line token bump if it reads too washed out.

## Structure

- **Routes (dynamic from day one):** `/` (home), `/listings` (PLP), `/listings/[slug]` (PDP), `/communities/[slug]`.
- **Data:** hardcoded **typed TS modules** in `apps/web/src/data/`, shaped to mirror a future Payload schema. `[slug]` pages look up from these. Backend currently has only `Users` + `Media` collections — **no backend wiring in this work**; swap to Payload fetches later behind the same types.
- **Fonts:** Playfair Display (serif display) + Manrope (sans) via `next/font/google` as CSS vars. **Drop** Geist, Cormorant, Lora (Cormorant/Lora are unused token defs).
- **Components:** shadcn primitives (from `@mvp-realty/ui`) for form controls (Input, NativeSelect, Checkbox, Slider, ToggleGroup for beds/baths) + a `Button` with cva variants bound to **role tokens** (`cta`/`primary`/`outline`/`glass`). Hero/sections/nav/footer/cards = bespoke Tailwind. App-specific components in `apps/web/src/components`; generic primitives stay in `@mvp-realty/ui`. Nav + Footer in root `apps/web/src/app/layout.tsx` (all web pages are marketing).
- **Interactivity:** idiomatic React. Filter/sort derives from the typed data array via `useState` + `useMemo` (**no DOM scraping**). Carousel / favorites / nav-shadow as small `'use client'` components. Reveal-on-scroll via a tiny hook or pure CSS. Sections stay Server Components; only interactive leaves are client.
- **Assets:** copy referenced photos to `apps/web/public/images/…`, **slugified filenames** (no spaces), served via `next/image` (width/height or fill).
- **Forms:** lead-capture (home) + request-info (PDP) — markup + client validation; submit hits a **stub** that fakes success + shows a confirmation state, marked `// TODO: wire backend`.

## Delivery

- **Home page first** as a vertical slice (lay the theming spine, then the 10 sections), verified by flipping all 4 themes in the switcher → fidelity/pattern sign-off.
- After sign-off, the **three remaining slices run in parallel by separate agents: Home polish, PLP (`/listings`), PDP (`/listings/[slug]`)** — plus `/communities/[slug]`. These depend on the theming spine + shared Nav/Footer + `Button`/control variants existing first.

## Page inventories (all 4 pages)

Section list per page, from the `data-screen-label` markers in `design-draft/*.html`. Use these as the build checklist for each slice. **Nav + Footer are shared** (already built in `layout.tsx`) — don't rebuild per page.

### Home (`/`) — `index.html` — ✅ BUILT
Hero · Communities strip · Featured Communities · Featured Residences · The Life (lifestyle) · Testimonials (carousel) · Amenities · Meet the Owner · Lead Capture. (Implemented in `apps/web/src/components/home/*`.)

### PLP — listings index (`/listings`) — `listings.html` — ✅ BUILT (decisions in "Resolved — PLP" above)
Implemented: `apps/web/src/app/listings/page.tsx`; data `apps/web/src/data/listings.ts` (15 entries) + `Listing` type in `data/types.ts`; pure logic `apps/web/src/lib/listing-filters.ts` (+ 22 passing unit tests) and URL bridge `lib/use-listing-filters.ts`; components in `apps/web/src/components/listings/` (`listings-hero`, `hero-search`, `quick-filter-bar`, `filter-panel`, `active-filter-chips`, `listing-card`, `listings-browser`, `concierge-cta`). `Container` now forwards HTML attrs (e.g. `id`). `ListingCard` is the reusable tile for PDP "Similar Homes" / community "Homes for Sale".
- **Hero** (`s-hero`) — compact page hero/heading.
- **Quick filters bar** (`s-quickbar`) — keyword + sort, sticky.
- **Filter sidebar** (`aside.s-aside`): Price Range (min/max `<select>`: No min/$500k/$750k/$1M/$1.5M/$2M), Bedrooms + Bathrooms (segmented `Any/2+/3+/4+`), Property Type (estate/single-family/villa/condo, with tally counts), Community (bonita-bay/valencia-bonita/valencia-trails/seaside-cove/coral-lagoon/mangrove-bay), Status (now-selling/move-in/new-model), Features (waterfront/pool/golf/gated/55plus). Checkboxes with tally badges.
- **Results grid** of listing cards + **active-filter chips** (removable) + **sort select** (price asc/desc, beds desc, sqft desc) + **empty state**.
- **Concierge CTA** (`s-cta`).
- Listing card data shape (drives filter/sort): `price, beds, baths, sqft, type, community, status, features[], name, slug`. Filter/sort must derive from the typed data array in React (no DOM scraping) per the spine rule.

### PDP — property detail (`/listings/[slug]`) — `property.html` — ✅ BUILT ("as-is", 2026-06-09)
Dynamic route `apps/web/src/app/listings/[slug]/page.tsx` (`generateStaticParams` + `notFound`). Derivation `apps/web/src/data/property.ts` → `getPropertyView(slug)` combines the `Listing` with derived/templated PDP fields (pricePerSqft, deterministic address/year/lot/taxes/hoa/mls via a hash — no randomness; 5-image gallery; similar = same-community→same-type, max 3). Components `apps/web/src/components/listings/property-*.tsx` (gallery, header, actions, body, aside+tour-form, community band, similar). Homepage featured-residence cards now deep-link here.
- **Breadcrumb** · **Gallery** (multi-image, from `assets/communities/<community>/` sets) · **Title & Key Facts** (status, price + $/sqft, address, fact tiles: beds/baths/sqft/etc.).
- Body sections: **Overview · Interior · Floor Plan · Exterior · Location · Listing Courtesy.**
- **Agent & Tour sidebar** (`aside.p-aside`, sticky) with **Tour request form** (stub submit).
- **Community Key Facts** · **Similar Homes** (related listings).

### Community (`/communities/[slug]`) — `community.html` — ✅ BUILT ("as-is", 2026-06-09)
Dynamic route `apps/web/src/app/communities/[slug]/page.tsx` over all 6 community slugs (`generateStaticParams` + `notFound`). Content `apps/web/src/data/community-detail.ts` → `getCommunityDetail(slug)` (`CommunityDetail`: prose, 6 facts, amenities, clubs, 2 models, review score+bars+cards, FAQs, gallery, similar-nearby). Components `apps/web/src/components/communities/*` (detail-header, header-actions, stars, gallery, section-tabs w/ IntersectionObserver scrollspy, main-content, amenity-icon, floorplan, agent-aside, similar-communities, tour-band). Homes-for-Sale rail reuses `ListingCard` over `listings.filter(community===slug)`; "See all" → `/listings?community=slug`. Homepage community cards now deep-link here.
- **Header** · **Gallery** · **Tabbed nav** (`c-tabs`, anchors to blocks).
- Blocks: **Overview · Homes for Sale · Models · Amenities · Lifestyle · Reviews · FAQs.**
- **Agent sidebar** (sticky) · **Similar Nearby** communities · **Request a Tour** section.

## Resolved — PLP `/listings` (grilled 2026-06-09)

1. **Filter state = URL search params**, not local state. URL is the single source of truth; `sort` and the hero `q` (keyword) live in the URL too. Shareable concierge links, back-button, refresh-safe — consistent with the `?theme=` pattern. Results still derive via `useMemo` over the typed array (no DOM scraping). Param schema: `q`, `min`, `max`, `beds`, `baths`, `type`, `community`, `status`, `features` (the array facets comma-joined, e.g. `type=estate,villa`), `sort` (omitted when `featured`). Writes use `router.replace(url, { scroll: false })`.
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

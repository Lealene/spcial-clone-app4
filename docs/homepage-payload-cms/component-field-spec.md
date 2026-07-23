# Homepage component field spec

Status: **draft for implementation planning (2026-06-19)**.

Goal: every content value rendered by the current homepage should be editable from Payload CMS, while the approved frontend design remains locked. Editors can change copy, media, links, card data, counts, labels, form text, SEO, and ordering. Editors should not change button colors, button variants, section spacing, typography, layout, animations, or visual style tokens.

## Source Components

Homepage route: [apps/web/src/app/page.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/app/page.tsx).

Current homepage order:

1. `Hero`
2. `CommunitiesStrip`
3. `FeaturedCommunities`
4. `FeaturedResidences`
5. `TheLife`
6. `Testimonials`
7. `Amenities`
8. `MeetTheOwner`
9. `LeadCapture`

Site shell:

- `SiteNav`
- `SiteFooter`

## Global Rules

- Use Payload `blocks` for homepage sections.
- Use Payload `globals` for nav and footer.
- Store images as upload relationships to `media`.
- Keep image alt text editable. Prefer media `alt`, with per-use alt override when the same image might need different context.
- Store links with a shared `link` field shape.
- Store button copy and destination. Do not expose button color, variant, icon style, size, or animation controls.
- Store section anchors because nav links depend on IDs like `#lifestyle`, `#amenities`, `#communities`, `#lead`, and `#concierge`.
- Store display labels for count suffixes and CTA text instead of hardcoding words like `residences`, `reviews`, `now selling`, or `View residence`.
- Keep arrays sortable in Payload admin.
- Use admin descriptions to tell editors recommended image aspect ratios and character ranges.
- Prefer plain text/textarea for tightly designed headings. Use rich text only where inline formatting or links are truly needed.

## Shared Field Primitives

### Link Field

Use this wherever a nav item, CTA, card, footer link, or inline text link appears.

Fields:

- `label`: text.
- `type`: select `internal`, `custom`, `anchor`, `phone`, `email`.
- `page`: relationship to `pages`, shown for `internal`.
- `customUrl`: text, shown for `custom`.
- `anchor`: text, shown for `anchor`; examples: `#lead`, `/#lead`.
- `phone`: text, shown for `phone`.
- `email`: email, shown for `email`.
- `newTab`: checkbox.
- `ariaLabel`: optional text.

Derived frontend `href`:

- `internal`: page route from related page slug.
- `custom`: `customUrl`.
- `anchor`: `anchor`.
- `phone`: `tel:...`.
- `email`: `mailto:...`.

### CTA Field

Fields:

- `label`: text.
- `link`: shared link field.
- `ariaLabel`: optional text.

Not editor-controlled:

- button variant
- button size
- button icon
- hover behavior
- colors

### Media Field

Fields:

- `image`: upload relationship to `media`.
- `altOverride`: optional text.
- `caption`: optional text where rendered.

Admin note: the `media.alt` field remains required. Use `altOverride` only when this placement needs different alt text.

### Section Header Field

Fields:

- `anchorId`: text, optional.
- `kicker`: text.
- `heading`: text.
- `headingAccent`: optional text for the emphasized phrase currently rendered inside `<em>`.
- `lede`: textarea.

Not editor-controlled:

- alignment, unless the existing block has a real left/center variant.
- text size
- text color
- spacing

### Repeated Card Controls

For repeated cards, include:

- `items`: array, sortable.
- `maxItems`: number, optional guardrail.
- `emptyState`: optional group if the block can render with no items.
- `sourceMode`: select when the block can later use relationships or queries.

## Page-Level Fields

The `pages` document should include:

- `title`
- `slug`
- `seo`
- `layout`

For the homepage document:

- `title`: `Home`.
- `slug`: `home`.
- route: `/`.

Page-level SEO is specified in [README.md](./README.md#page-seo-model). SEO should not be a CMS page block.

## Header Global: `SiteNav`

Source: [apps/web/src/components/site-nav.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/site-nav.tsx).

Global slug: `header`.

Fields:

- `brandHomeLink`: shared link field, default `/`.
- `brandLabel`: text, default `MVP Realty`.
- `brandMarkAlt`: optional text for screen readers if the code-rendered mark becomes non-decorative.
- `navItems`: sortable array.
- `navItems.label`: text.
- `navItems.link`: shared link field.
- `navItems.ariaLabel`: optional text.
- `primaryCta`: CTA field.
- `mobileMenuLabel`: text, default `Menu`.
- `mobileMenuCloseLabel`: text, default `Close menu`.

Optional future fields:

- `logoImage`: upload relationship to `media`, only if replacing the code-rendered brand mark.
- `logoAlt`: text, shown if `logoImage` is used.

Not editor-controlled:

- sticky behavior
- scroll shadow
- mobile breakpoint
- hamburger icon
- button variant/color
- brand mark shape and styling, unless a future logo image mode is intentionally added

Current hardcoded content to migrate:

- `The Life` -> `/#lifestyle`
- `Amenities` -> `/#amenities`
- `Communities` -> `/#communities`
- `Residences` -> `/listings`
- CTA `Request My Shortlist` -> `/#lead`

## Footer Global: `SiteFooter`

Source: [apps/web/src/components/site-footer.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/site-footer.tsx).

Global slug: `footer`.

Fields:

- `brandName`: text.
- `brandAccentText`: optional text, currently `Realty`.
- `brandBlurb`: textarea.
- `columns`: sortable array.
- `columns.title`: text.
- `columns.links`: sortable array.
- `columns.links.label`: text.
- `columns.links.link`: shared link field.
- `columns.links.ariaLabel`: optional text.
- `bottomLeftText`: text, currently copyright.
- `bottomRightLinks`: sortable array, preferred over one hardcoded text string.
- `bottomRightLinks.label`: text.
- `bottomRightLinks.link`: shared link field.
- `bottomRightTextFallback`: optional text for legal copy if no links are provided.

Not editor-controlled:

- footer background color
- column layout
- typography
- hover color

Current hardcoded content to migrate:

- Brand: `MVP Realty`.
- Blurb: Florida Gulf-Coast concierge copy.
- Columns: `Residences`, `Explore`, `Concierge`.
- Bottom text: copyright and legal labels.

## Block: `hero`

Source: [apps/web/src/components/blocks/hero.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/blocks/hero.tsx).

Purpose: first viewport hero with background image, eyebrow, headline, lede, and two CTAs.

Fields:

- `anchorId`: optional text.
- `backgroundImage`: media field, required.
- `backgroundImagePriority`: checkbox, default true for homepage hero.
- `eyebrow`: text.
- `heading`: text.
- `headingAccent`: text, currently `takes care of itself.`
- `lede`: textarea.
- `primaryCta`: CTA field.
- `secondaryCta`: CTA field.

Optional content controls:

- `showEyebrowMarker`: checkbox, default true.
- `showPrimaryCtaIcon`: checkbox, default true.
- `showSecondaryCta`: checkbox, default true.

Not editor-controlled:

- veil gradient
- hero height
- text color
- CTA variants
- animation timing
- background image object-fit

Current hardcoded content to migrate:

- Background image: `/images/hero-naples-waterfront.jpg`.
- Eyebrow: `By Appointment · Naples & the Gulf Coast`.
- Heading: `A prestigious address, and a life that`.
- Accent: `takes care of itself.`
- Lede: private gated communities copy.
- Primary CTA: `View Residences` -> `/#listings`.
- Secondary CTA: `Request My Shortlist` -> `/#lead`.

## Block: `communitiesStrip`

Source: [apps/web/src/components/blocks/communities-strip.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/blocks/communities-strip.tsx).

Purpose: compact strip of community links under the hero.

Fields:

- `anchorId`: optional text.
- `sourceMode`: select `manual`, later `selected`, later `query`; default `manual`.
- `items`: sortable array for manual mode.
- `items.name`: text.
- `items.blurb`: textarea.
- `items.slug`: text, for future matching.
- `items.link`: shared link field.
- `items.icon`: select, default `mapPin`.
- `maxItems`: number, default 3.

Future relationship fields:

- `selectedCommunities`: relationship to `communities`, `hasMany: true`, added only after the collection exists.
- `query`: group for future automatic selection rules.

Not editor-controlled:

- dark strip style
- grid columns
- icon color
- hover background

Current hardcoded content to migrate:

- Bonita Bay.
- Valencia Bonita.
- Valencia Trails.

## Block: `featuredCommunities`

Source: [apps/web/src/components/blocks/featured-communities.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/blocks/featured-communities.tsx).

Purpose: section header plus three featured community cards.

Fields:

- `anchorId`: text, default `communities`.
- `header`: section header field.
- `sourceMode`: select `manual`, later `selected`, later `query`; default `manual`.
- `manualCommunities`: sortable array.
- `manualCommunities.slug`: text.
- `manualCommunities.name`: text.
- `manualCommunities.locality`: text.
- `manualCommunities.rating`: number.
- `manualCommunities.reviews`: number.
- `manualCommunities.reviewsLabel`: text, default `reviews`.
- `manualCommunities.priceRange`: text.
- `manualCommunities.tags`: array of text.
- `manualCommunities.residences`: number.
- `manualCommunities.residencesLabel`: text, default `residences`.
- `manualCommunities.nowSelling`: number.
- `manualCommunities.nowSellingLabel`: text, default `now selling`.
- `manualCommunities.image`: media field.
- `manualCommunities.link`: shared link field.
- `moreLink`: CTA/link field rendered as `MoreLink`.
- `emptyStateHeading`: optional text.
- `emptyStateBody`: optional textarea.

Future relationship fields:

- `selectedCommunities`: relationship to `communities`, `hasMany: true`, added only after the collection exists.
- `query`: group with `limit`, `sort`, `featuredOnly`, and status filters.

Not editor-controlled:

- card layout
- star icon
- rating badge style
- number formatting style
- section background
- MoreLink styling

Current hardcoded content to migrate:

- Header: `Featured Communities`, `Three favorites to start your search.`, current lede.
- Cards from `apps/web/src/data/communities.ts`.
- More link: `Explore all communities` -> currently `/listings`.

## Block: `featuredResidences`

Source: [apps/web/src/components/blocks/featured-residences.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/blocks/featured-residences.tsx).

Purpose: section header plus listing/residence cards. This block needs listing-like data before the real `listings` collection exists.

Fields:

- `anchorId`: text, default `listings`.
- `header`: section header field.
- `sourceMode`: select `manual`, later `selected`, later `query`; default `manual`.
- `manualListings`: sortable array.
- `manualListings.slug`: text.
- `manualListings.name`: text.
- `manualListings.locality`: text.
- `manualListings.price`: number, optional but useful for future migration.
- `manualListings.priceLabel`: text.
- `manualListings.beds`: number.
- `manualListings.bedsLabel`: text, default `Beds`.
- `manualListings.baths`: number.
- `manualListings.bathsLabel`: text, default `Baths`.
- `manualListings.sqft`: number.
- `manualListings.sqftLabel`: text, default `Sq Ft`.
- `manualListings.badge`: text.
- `manualListings.image`: media field.
- `manualListings.link`: shared link field.
- `cardCtaLabel`: text, default `View residence`.
- `moreLink`: CTA/link field rendered as `MoreLink`.
- `emptyStateHeading`: optional text.
- `emptyStateBody`: optional textarea.

Future relationship fields:

- `selectedListings`: relationship to `listings`, `hasMany: true`, added only after the collection exists.
- `query`: group with `limit`, `sort`, `status`, `community`, `priceMin`, `priceMax`, and feature filters.

Resolver rule:

- Components should receive normalized card props, not raw block data.
- In `manual` mode, normalize `manualListings`.
- In future `selected` mode, normalize related listing documents.
- In future `query` mode, fetch and normalize listing results.

Not editor-controlled:

- card grid
- stat layout
- card CTA icon
- card border/shadow/hover styles
- button/link styling

Current hardcoded content to migrate:

- Header: `Curated Residences`, `Homes chosen for you, not a search bar.`, current lede.
- Cards from `apps/web/src/data/residences.ts`.
- Card CTA: `View residence`.
- More link: `View the full collection` -> `/listings`.

## Block: `lifestyle`

Source: [apps/web/src/components/blocks/the-life.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/blocks/the-life.tsx).

Purpose: full-width editorial image band with lifestyle copy and three image tiles.

Fields:

- `anchorId`: text, default `lifestyle`.
- `backgroundImage`: media field.
- `kicker`: text.
- `heading`: text.
- `headingAccent`: text.
- `body`: textarea.
- `tiles`: sortable array.
- `tiles.caption`: text.
- `tiles.image`: media field.
- `tiles.link`: optional shared link field, if future tiles should be clickable.
- `maxTiles`: number, default 3.

Not editor-controlled:

- dark veil gradient
- tile aspect ratio
- tile hover zoom
- section minimum height
- text color

Current hardcoded content to migrate:

- Background image from `unsplash('1414235077428-338989a2e8c0')`.
- Kicker: `The Life Inside the Gates`.
- Heading and accent: `You buy the home. You stay for` / `the people.`
- Body copy.
- Three lifestyle tiles from `apps/web/src/data/lifestyle.ts`.

## Block: `testimonials`

Source: [apps/web/src/components/blocks/testimonials.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/blocks/testimonials.tsx).

Purpose: client carousel with resident portraits, quotes, tabs, counter, and arrow controls.

Fields:

- `anchorId`: text, default `testimonials`.
- `kicker`: text.
- `heading`: text.
- `headingAccent`: text.
- `stories`: sortable array.
- `stories.slug`: text.
- `stories.name`: text.
- `stories.location`: text.
- `stories.quote`: textarea.
- `stories.portrait`: media field.
- `stories.tabAriaLabel`: optional text; defaults to `name`.
- `carouselAutoPlay`: checkbox, default true.
- `carouselIntervalMs`: number, default `6500`.
- `previousLabel`: text, default `Previous story`.
- `nextLabel`: text, default `Next story`.
- `tabListLabel`: text, default `Choose a resident story`.
- `counterSeparator`: text, default `/`.
- `emptyStateHeading`: optional text.
- `emptyStateBody`: optional textarea.

Not editor-controlled:

- carousel transition timing besides interval
- portrait stack layout
- quote mark style
- control button style
- background glow

Validation:

- Require at least one story if the block is enabled.
- Require portrait alt text through media.

Current hardcoded content to migrate:

- Kicker: `In Their Words`.
- Heading and accent: `The address impressed them. The` / `people`.
- Six stories from `apps/web/src/data/testimonials.ts`.
- Auto interval: `6500`.

## Block: `amenities`

Source: [apps/web/src/components/blocks/amenities.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/blocks/amenities.tsx).

Purpose: section header, large feature image with caption, and amenity icon cards.

Fields:

- `anchorId`: text, default `amenities`.
- `header`: section header field.
- `featureImage`: media field.
- `featureTitle`: text.
- `featureCaption`: textarea.
- `amenities`: sortable array.
- `amenities.icon`: select `pool`, `racquet`, `fitness`, `dining`, `trails`, `calendar`.
- `amenities.title`: text.
- `amenities.blurb`: textarea.
- `emptyStateHeading`: optional text.
- `emptyStateBody`: optional textarea.

Not editor-controlled:

- icon SVG paths beyond the allowed icon select
- grid layout
- card background/hover color
- image overlay gradient

Current hardcoded content to migrate:

- Header: `The Resort at Your Door`, `Every day arranged like a stay at a fine resort.`, current lede.
- Feature image from `unsplash('1576013551627-0cc20b96c2a7')`.
- Feature caption title: `The Grand Clubhouse`.
- Six amenity cards from `apps/web/src/data/amenities.ts`.

## Block: `ownerIntro`

Source: [apps/web/src/components/blocks/meet-the-owner.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/blocks/meet-the-owner.tsx).

Purpose: owner/concierge intro with portrait, badge, biography, signature, and credential stats.

Fields:

- `anchorId`: text, default `concierge`.
- `portrait`: media field.
- `portraitBadgeLabel`: text, default `Broker & Owner`.
- `kicker`: text.
- `heading`: text.
- `headingAccent`: text.
- `titleLine`: text, currently `Eleanor Voss · Broker & Owner, MVP Realty`.
- `bio`: textarea.
- `signature`: text.
- `credentials`: sortable array.
- `credentials.value`: text.
- `credentials.label`: text.

Optional future fields:

- `contactCta`: optional CTA field.
- `licenseNumber`: optional text.
- `phone`: optional text.
- `email`: optional email.

Not editor-controlled:

- decorative accent shapes
- star badge icon
- image frame styling
- stat typography/layout

Current hardcoded content to migrate:

- Portrait: `/images/owner-eleanor-voss.jpg`.
- Badge: `Broker & Owner`.
- Kicker: `Meet the Owner`.
- Heading and accent: `One person, from first call to` / `front door.`
- Title line, bio, signature, and three credentials.

## Block: `leadCapture`

Source: [apps/web/src/components/blocks/lead-capture.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/components/blocks/lead-capture.tsx).

Purpose: lead capture copy and form. Submission is currently stubbed, but the content should be CMS-managed now.

Fields:

- `anchorId`: text, default `lead`.
- `kicker`: text.
- `heading`: text.
- `body`: textarea.
- `helperNote`: rich text or structured inline note group.
- `helperNote.icon`: select, default `waves`.
- `helperNote.beforeLinkText`: text.
- `helperNote.link`: shared link field.
- `helperNote.linkLabel`: text.
- `helperNote.afterLinkText`: text.
- `formFields`: sortable array if form fields become CMS-configurable.
- `formFields.name`: text, stable key such as `name`, `email`, `phone`.
- `formFields.label`: text.
- `formFields.type`: select `text`, `email`, `tel`, `textarea`.
- `formFields.placeholder`: text.
- `formFields.autoComplete`: text.
- `formFields.required`: checkbox.
- `formFields.validationMessageRequired`: text.
- `formFields.validationMessageInvalid`: text.
- `submitLabel`: text.
- `privacyText`: textarea.
- `successIconLabel`: optional text for accessibility if needed.
- `successHeading`: text.
- `successBody`: textarea.
- `errorRequiredMessage`: text, current name/email message.
- `errorInvalidEmailMessage`: text.

Recommended first implementation:

- Keep the actual field set code-defined for reliability: name, email, phone.
- Make labels, placeholders, required messages, submit label, privacy text, and success text editable.
- Add fully dynamic form-field config only when lead routing/storage is ready.

Not editor-controlled:

- input styling
- form validation logic beyond messages and required flags
- submit button style
- success card style

Current hardcoded content to migrate:

- Kicker: `Your Private Introduction`.
- Heading: `Let a concierge prepare your shortlist.`
- Body copy.
- Helper note copy and link.
- Labels/placeholders for name, email, phone.
- Submit label: `Request My Shortlist`.
- Privacy text.
- Success heading/body.
- Validation messages.

## Design-Locked Fields

Do not expose these as Payload fields for the CMS page blocks:

- button color or variant
- button size
- icon stroke width/color
- section background colors
- typography sizes
- spacing
- border radius
- shadows
- animation delays
- responsive grid breakpoints
- decorative gradients and veils
- card hover effects

If a future business need requires style variants, add a constrained `layoutVariant` or `tone` select per block. Do not expose raw CSS, arbitrary color pickers, or freeform class names.

## Payload Admin UX Recommendations

- Group block fields with tabs: `Content`, `Media`, `Items`, `Links`, `Settings`.
- Put advanced fields under collapsed groups.
- Add admin descriptions for ideal image ratios:
  - Hero: full-width landscape, at least 2000px wide.
  - Community cards: 16:11.
  - Residence cards: 4:3.
  - Lifestyle tiles: 3:4.
  - Testimonials portraits: 4:5.
  - Owner portrait: 4:5.
- Add min/max rows:
  - Communities strip: 1-3 recommended.
  - Featured communities: 1-3 recommended.
  - Featured residences: 1-3 recommended.
  - Lifestyle tiles: 1-3 recommended.
  - Testimonials: 1-8 recommended.
  - Amenities: 1-6 recommended.
  - Owner credentials: 1-4 recommended.
- Use conditional admin fields for `sourceMode`.
- Keep `manual` mode available even after relationships exist for campaign-specific cards.

## Implementation Checklist

- Create shared field helpers for link, CTA, media, section header, and SEO.
- Create one block config per homepage component.
- Convert each homepage component to accept props matching normalized DTOs.
- Create a block renderer keyed by `blockType`.
- Keep style decisions in React/CSS, not in Payload.
- Add tests for block normalization.
- Add at least one fixture matching the current homepage content.
- Seed the local Payload homepage/header/footer with `pnpm -C apps/backend seed:homepage:local`.
- Keep adapter-level fallbacks for partial editor content so missing copy/media does not crash page rendering.

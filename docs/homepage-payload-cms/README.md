# Homepage Payload CMS integration plan

Status: **historical plan; active architecture is in `docs/architecture/cms-page-builder.md` (2026-06-19)**.

Goal: make the current homepage fully editable from Payload CMS without losing the finished frontend design. The homepage should be the first document in a reusable page-builder model, so future pages can be created in Payload by selecting, configuring, and sorting blocks.

Related docs:

- [Component field spec](./component-field-spec.md) - exact Payload-editable fields for each current homepage component, header global, and footer global.

## Recommendation

Use a `pages` collection now, not a homepage-only collection or homepage global.

Create the homepage as a `pages` document with `slug: "home"` and render it at `/`. Later, the same collection can power generic CMS pages at routes like `/[slug]`.

Use Payload globals for the navigation and footer. Payload globals are single-instance documents, which fits site-wide header/footer content better than pages or blocks.

Add a page-level SEO field group to every `pages` document. SEO should not be a sortable block because it describes the whole document, not a visible page section. Treat it as a reusable field group or Payload SEO plugin extension that sits alongside `title`, `slug`, and `layout`.

Add a separate site-wide SEO settings global later if needed for defaults such as site name, title template, default social image, social handles, search verification tokens, and robots defaults.

## Source facts

- The current homepage route is [apps/web/src/app/page.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/app/page.tsx).
- The homepage is already decomposed into section components under `apps/web/src/components/blocks/`.
- The current homepage order is: `Hero`, `CommunitiesStrip`, `FeaturedCommunities`, `FeaturedResidences`, `TheLife`, `Testimonials`, `Amenities`, `MeetTheOwner`, `LeadCapture`.
- Global shell content is rendered in [apps/web/src/app/layout.tsx](/Users/jomar/Documents/work/mvp-realty/apps/web/src/app/layout.tsx) with `SiteNav` and `SiteFooter`.
- The backend registers `Users`, `Media`, and `Pages`, plus Header/Footer globals, in [apps/backend/src/payload.config.ts](/Users/jomar/Documents/work/mvp-realty/apps/backend/src/payload.config.ts).
- `Media` already supports uploads and required alt text in [apps/backend/src/collections/Media.ts](/Users/jomar/Documents/work/mvp-realty/apps/backend/src/collections/Media.ts).
- `@payloadcms/plugin-seo` is not currently installed; using it would be a new dependency decision.
- The web app must not import from `apps/backend`; shared runtime-safe schemas and DTOs belong in `@mvp-realty/api-contracts`.
- The web app talks to the backend through `NEXT_PUBLIC_BACKEND_URL` in [apps/web/src/env.ts](/Users/jomar/Documents/work/mvp-realty/apps/web/src/env.ts).

## Architecture

Payload backend:

- Add a `Pages` collection.
- Add reusable block config files.
- Add reusable page SEO fields.
- Add `Header` and `Footer` globals.
- Keep media in the existing `media` collection.
- Generate Payload types after schema changes.

Next frontend:

- Fetch CMS data from Payload REST or GraphQL from Server Components.
- Do not import backend Payload config or generated backend types into `apps/web`.
- Validate/normalize API responses through shared contracts in `@mvp-realty/api-contracts`.
- Render `page.layout` through a block renderer keyed by `block.blockType`.
- Build Next `Metadata` from the page-level SEO group in `generateMetadata`.
- Keep interactive leaves as client components, for example nav menu state, testimonial carousel, and lead forms.

## Backend model

### `pages` collection

Suggested location: `apps/backend/src/collections/Pages.ts`.

Fields:

- `title`: required text.
- `slug`: required text, unique, indexed.
- `layout`: Payload `blocks` field.
- `seo`: reusable SEO field group, detailed below.

Config:

- `versions: { drafts: true }`.
- Public read access returns only published documents.
- Authenticated users can create/update/delete.
- `defaultPopulate` should expose only lightweight fields such as `title` and `slug`, so globals can link to pages without hydrating full layouts.
- Reserve `slug: "home"` for `/`; do not store `/` as a slug.

Register in `payload.config.ts`:

```ts
collections: [Users, Media, Pages],
globals: [Header, Footer],
```

### Page SEO model

Suggested location: `apps/backend/src/fields/seo.ts`.

This should be a reusable Payload field group named `seo` and mounted on `Pages`. It can be implemented manually or with `@payloadcms/plugin-seo` as the base.

Recommendation:

- If adding `@payloadcms/plugin-seo` is acceptable, use it for its editor experience: meta title, description, image, search snippet preview, character indicators, and generator hooks.
- Extend the plugin fields for the advanced SEO fields below.
- If avoiding another dependency, implement a manual `seo` group with the same field shape. The frontend should not care whether the fields came from a plugin or custom config.

The default editable fields should cover practical SEO without forcing editors to touch advanced fields on every page.

#### Search result fields

- `metaTitle`: override for `<title>`.
- `metaDescription`: override for `<meta name="description">`.
- `keywords`: optional tag/text array. Low search value, but still useful for internal editorial planning and some integrations.
- `canonicalMode`: `auto` or `custom`.
- `canonicalUrl`: required only when `canonicalMode` is `custom`.
- `breadcrumbLabel`: optional short label for future breadcrumb JSON-LD and navigation trails.
- `focusKeyword`: optional editorial field for previews/checklists; not rendered directly unless needed.
- `seoNotes`: optional admin-only textarea for content review notes.

Frontend fallback rules:

- Title falls back to `seo.metaTitle`, then page `title`.
- Description falls back to `seo.metaDescription`, then an excerpt from the first meaningful block.
- Canonical falls back to `NEXT_PUBLIC_SITE_URL` plus the computed route.

#### Author and classification fields

- `authors`: optional array of author name and URL.
- `creator`: optional page-level creator override.
- `publisher`: optional page-level publisher override.
- `category`: optional page category.
- `archives`: optional array of archive URLs.
- `assets`: optional array of related asset URLs.
- `bookmarks`: optional array of bookmark URLs.
- `referrerPolicy`: optional advanced select for the page's referrer meta value.

These should be advanced fields for normal marketing pages. They become more useful later for blog posts, market reports, community guides, and other editorial content.

#### Robots and indexing fields

- `index`: checkbox, default true.
- `follow`: checkbox, default true.
- `noArchive`: checkbox.
- `noSnippet`: checkbox.
- `noImageIndex`: checkbox.
- `noTranslate`: checkbox.
- `unavailableAfter`: optional datetime for time-sensitive pages.
- `maxSnippet`: number or blank.
- `maxImagePreview`: select `none`, `standard`, or `large`.
- `maxVideoPreview`: number or blank.
- `googleBotOverride`: checkbox to reveal Googlebot-specific overrides.
- `googleBotIndex`.
- `googleBotFollow`.
- `googleBotMaxSnippet`.
- `googleBotMaxImagePreview`.
- `googleBotMaxVideoPreview`.

Default behavior should be `index, follow` unless an editor explicitly changes it.

#### Open Graph fields

- `ogTitle`: optional social title override.
- `ogDescription`: optional social description override.
- `ogImage`: upload relationship to `media`.
- `ogImageAlt`: optional alt override; falls back to media `alt`.
- `ogType`: select, default `website`; allow `website`, `article`, and future business/listing types if needed.
- `ogUrl`: optional URL override; defaults to canonical URL.
- `ogSiteName`: optional per-page override; defaults to site settings.
- `ogLocale`: optional locale, default `en_US`.
- `ogLocaleAlternates`: optional array of locale codes.
- `ogDeterminer`: optional advanced value if ever needed.
- `ogArticle`: conditional group shown when `ogType` is `article`.
- `ogArticle.publishedTime`.
- `ogArticle.modifiedTime`.
- `ogArticle.expirationTime`.
- `ogArticle.authors`.
- `ogArticle.section`.
- `ogArticle.tags`.

For the homepage, `ogType` should be `website`.

#### Twitter/X card fields

- `twitterCard`: select `summary` or `summary_large_image`, default `summary_large_image`.
- `twitterTitle`: optional override.
- `twitterDescription`: optional override.
- `twitterImage`: upload relationship to `media`.
- `twitterImageAlt`: optional alt override.
- `twitterSite`: optional site handle override; defaults to site settings.
- `twitterCreator`: optional author/creator handle.
- `twitterPlayer`: optional advanced group for player cards if video embeds ever need a first-class card.
- `twitterPlayer.url`.
- `twitterPlayer.width`.
- `twitterPlayer.height`.

Do not require separate Twitter fields when they can safely fall back to Open Graph fields.

#### Alternate URLs and localization fields

- `alternateLanguages`: array with locale and URL.
- `alternateMedia`: advanced array with media query and URL.
- `alternateTypes`: advanced array with MIME type and URL, for example RSS.

Localization is not implemented yet, so this can start hidden/collapsed until there is a real need.

#### Structured data fields

- `schemaMode`: `auto`, `custom`, or `disabled`.
- `schemaType`: select common page-level types such as `WebPage`, `AboutPage`, `ContactPage`, `CollectionPage`, `SearchResultsPage`, `RealEstateAgent`, and `LocalBusiness`.
- `customJsonLd`: JSON/code field for advanced schema markup.
- `includeBreadcrumbJsonLd`: checkbox.
- `includeOrganizationJsonLd`: checkbox, usually true only for homepage or site-wide output.
- `includeWebSiteJsonLd`: checkbox, usually true only for homepage or site-wide output.

Implementation rule: validate `customJsonLd` as JSON before save or before render. Do not allow arbitrary scripts from CMS fields.

#### Sitemap fields

- `includeInSitemap`: checkbox, default true for published pages.
- `sitemapPriority`: number from `0.0` to `1.0`, optional.
- `sitemapChangeFrequency`: select `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`.
- `sitemapLastModifiedSource`: select `updatedAt`, `publishedAt`, or `manual`.
- `sitemapLastModified`: datetime, shown only for manual source.

Sitemap generation can come later, but the page model should not need another migration to support it.

#### Social and platform fields

- `facebookAppId`: optional advanced override; usually site-wide.
- `facebookAdmins`: optional array; usually site-wide.
- `pinterestRichPin`: optional checkbox.
- `appLinks`: optional advanced group for iOS, Android, and web app deep links if the business later has a mobile app.

These should be collapsed under an "Advanced social" group because most editors should not touch them.

#### Redirect and legacy URL fields

Redirects should eventually be their own collection rather than a dense page field, but SEO planning should account for them.

Recommended future collection: `apps/backend/src/collections/Redirects.ts`.

Fields:

- `sourcePath`: old path.
- `destination`: internal page relationship or custom URL.
- `statusCode`: `301` or `302`, default `301`.
- `preserveQuery`: checkbox.
- `notes`: admin-only textarea.

This lets editors retire old URLs without engineering changes and protects search equity during page migrations.

#### Advanced custom metadata fields

- `customMeta`: array of name/property/content rows.
- `customLinks`: array of rel/href/type/media rows, only for tags not covered by canonical or alternates.
- `customOther`: key/value rows that map to Next Metadata `other`.

Use this sparingly. Prefer typed fields above whenever possible.

#### Fields that should usually be site-wide, not page-level

Keep these in a future `SiteSettings` or `SEOSettings` global unless there is a strong reason to override per page:

- site name
- title template
- default meta image
- default Open Graph image
- default Twitter image
- Twitter site handle
- publisher/creator defaults
- search engine verification tokens
- default robots policy
- favicon/icons
- manifest URL
- app links
- Apple web app settings
- theme color
- color scheme
- viewport defaults

### SEO settings global

Suggested future location: `apps/backend/src/globals/SEOSettings.ts`.

This can be added in the same phase as page SEO if the team wants complete defaults immediately. Otherwise, page-level SEO can launch first and fall back to constants in `apps/web`.

Fields:

- `siteName`
- `siteUrl`
- `titleTemplate`
- `defaultTitle`
- `defaultDescription`
- `defaultImage`
- `defaultImageAlt`
- `twitterSite`
- `twitterCreator`
- `facebookAppId`
- `pinterestRichPin`
- `verification.google`
- `verification.bing`
- `verification.yandex`
- `verification.yahoo`
- `robotsDefaultIndex`
- `robotsDefaultFollow`
- `sitemapDefaults`

### Blocks

Suggested location: `apps/backend/src/blocks/`.

Each block should be a separate Payload `Block` config with:

- stable `slug`
- clear `labels`
- `interfaceName`
- fields that match the finished frontend component's content surface

Initial CMS page blocks:

- `hero`
- `communitiesStrip`
- `featuredCommunities`
- `featuredResidences`
- `lifestyle`
- `testimonials`
- `amenities`
- `ownerIntro`
- `leadCapture`

Use upload relationships to `media` for images instead of storing raw image URLs. This also lets the frontend eventually remove Unsplash remote image dependency.

### Dynamic content strategy

Some homepage sections should eventually pull from domain collections such as `communities` and `listings`, but those backend collections do not exist yet.

For now, use a source mode field on dynamic blocks:

```txt
sourceMode: manual | selected | query
```

Recommended staging:

- `manual`: block owns repeated card data directly. Use this first.
- `selected`: block stores relationships to future `communities` or `listings`.
- `query`: block stores rules like limit, sort, featured-only, or status.

This avoids blocking homepage CMS work on full real estate domain modeling.

### Listing-dependent CMS page blocks before `listings` exists

Do not add a Payload relationship field to `listings` until the `listings` collection exists. Payload relationship fields require a real `relationTo` target; pointing at a future collection would make the schema, admin UI, and generated types brittle.

For CMS page blocks that need listing/residence cards now, use manual card data first and normalize it to the same frontend DTO that future listing relationships will produce.

Initial `featuredResidences` block shape:

- `sourceMode`: default `manual`.
- `manualListings`: array of listing-card data.
- `manualListings.slug`.
- `manualListings.name`.
- `manualListings.locality`.
- `manualListings.priceLabel`.
- `manualListings.price`: optional numeric value for future sorting.
- `manualListings.beds`.
- `manualListings.baths`.
- `manualListings.sqft`.
- `manualListings.badge`.
- `manualListings.image`: upload relationship to `media`.
- `manualListings.imageAlt`: optional override; fall back to media `alt`.
- `ctaLabel`.
- `ctaLink`.

Frontend resolver contract:

```txt
FeaturedResidencesBlock -> FeaturedResidenceCard[]
```

The component should only receive normalized `FeaturedResidenceCard[]`, not raw Payload block data. That keeps the UI stable when the source changes.

Current resolver behavior:

- If `sourceMode` is `manual`, map `manualListings` into card props.

Future resolver behavior after `listings` exists:

- Add `sourceMode` options: `selected` and `query`.
- Add `selectedListings`: relationship field to `listings`, `hasMany: true`.
- Add `query`: group with filter/sort/limit fields, if curated automatic sections are needed.
- If `sourceMode` is `selected`, map populated listing relationships into card props.
- If `sourceMode` is `query`, fetch listings using the stored query settings and map results into card props.

Migration path:

1. Keep existing `manualListings` content in place.
2. Add the real `listings` collection.
3. Extend the block config with `selectedListings` and/or `query`.
4. Editors can switch a block from `manual` to `selected` once matching listing entries exist.
5. Optionally write a one-time migration script that matches manual listing slugs to real listing documents and fills `selectedListings`.
6. Keep `manual` mode as an escape hatch for one-off marketing cards that should not be tied to a live listing.

The same pattern should be used for community-dependent blocks until a real `communities` collection exists: manual cards first, relationship/query sources later.

### Header global

Suggested location: `apps/backend/src/globals/Header.ts`.

Fields:

- brand settings, or keep current code-rendered brand mark.
- `navItems`: array of links.
- CTA label and link.

Links should support:

- internal page relationship
- custom URL
- anchor/hash URL
- label override
- new-tab flag

### Footer global

Suggested location: `apps/backend/src/globals/Footer.ts`.

Fields:

- brand blurb
- footer columns array
- column title
- column links
- phone/contact links
- legal links
- copyright text

### Shared field helpers

Consider adding:

- `apps/backend/src/fields/link.ts`
- `apps/backend/src/fields/cta.ts`
- `apps/backend/src/fields/media.ts`
- `apps/backend/src/fields/sectionHeader.ts`
- `apps/backend/src/fields/seo.ts`

These should stay small and concrete. Add helpers only where repetition is real.

## Block field specs

### `hero`

Fields:

- background image
- eyebrow
- heading
- highlighted heading text
- lede
- primary CTA
- secondary CTA
- optional image priority flag

Maps to `Hero`.

### `communitiesStrip`

Fields:

- source mode
- manual community teaser cards
- selected community relationships later
- max item count

Maps to `CommunitiesStrip`.

### `featuredCommunities`

Fields:

- section kicker
- heading
- lede
- source mode
- manual cards now
- selected/query communities later
- CTA label and link

Maps to `FeaturedCommunities`.

### `featuredResidences`

Fields:

- section kicker
- heading
- lede
- source mode
- manual cards now
- selected/query listings later
- CTA label and link

Maps to `FeaturedResidences`.

### `lifestyle`

Fields:

- section anchor id
- background image
- kicker
- heading
- highlighted heading text
- body
- tile repeater with image and caption

Maps to `TheLife`.

### `testimonials`

Fields:

- section anchor id
- kicker
- heading
- highlighted heading text
- testimonial repeater
- testimonial name
- location
- quote
- portrait image
- optional carousel interval

Maps to `Testimonials`.

### `amenities`

Fields:

- section anchor id
- kicker
- heading
- lede
- feature image
- feature image title
- feature image caption
- amenity cards array
- icon select
- title
- blurb

Maps to `Amenities`.

### `ownerIntro`

Fields:

- section anchor id
- portrait image
- image badge text
- kicker
- heading
- highlighted heading text
- name/title line
- bio
- signature
- credential stats array

Maps to `MeetTheOwner`.

### `leadCapture`

Fields:

- section anchor id
- kicker
- heading
- body
- helper note
- form labels
- placeholders
- submit CTA
- privacy text
- success heading
- success body

Maps to `LeadCapture`.

Lead submission can remain stubbed at first, but the CMS block should be ready for a real leads endpoint later.

## Frontend integration

Add a small CMS layer in `apps/web`:

- `apps/web/src/lib/cms/client.ts`
- `apps/web/src/lib/cms/pages/index.ts`
- `apps/web/src/lib/cms/site-chrome.ts`
- `apps/web/src/lib/cms/pages/metadata.ts`

Responsibilities:

- build URLs from validated `env.NEXT_PUBLIC_BACKEND_URL`
- fetch by slug
- fetch header/footer globals
- fetch or apply SEO defaults
- normalize media URLs
- validate DTOs from `@mvp-realty/api-contracts`
- map Payload SEO fields to Next `Metadata`
- provide clear fallback behavior when CMS content is missing

Render flow for `/`:

1. Fetch page with slug `home`.
2. If missing, use a temporary static fallback during migration or return `notFound()` after launch.
3. Render `page.layout` with `CmsPageBlocksRenderer`.
4. `CmsPageBlocksRenderer` dispatches through the typed block registry keyed by `block.blockType`.
5. Unknown blocks return `null`.
6. Client components receive only serializable props.

Metadata flow for `/`:

1. Export `generateMetadata` from `apps/web/src/app/page.tsx`.
2. Fetch the same `home` page SEO data, using `select` or DTO parsing so the layout does not need to fetch all block content just for metadata.
3. Convert `page.seo` and defaults into a Next `Metadata` object.
4. Emit title, description, canonical, robots, Open Graph, Twitter card, alternates, and custom metadata.
5. Render JSON-LD from validated structured-data fields in the page itself or a small server component.

Important frontend changes:

- Convert current homepage components from internal hardcoded imports to props.
- Keep styling and markup stable while swapping the data source.
- Add Payload media host to `next/image` config.
- Keep `SiteNav` as client component, but pass CMS links into it.
- Keep `SiteFooter` as a server component unless interactivity is introduced.
- Replace hardcoded `metadata` exports with `generateMetadata` for CMS-backed pages.
- Keep root layout metadata as defaults only, not page-specific SEO.

## Preview, drafts, and cache invalidation

Use Payload drafts for pages.

Preview flow:

- Add a signed preview route in `apps/web`.
- Payload preview URL points to the web preview route.
- The route validates the signature and enables Next Draft Mode.
- Draft requests fetch draft content with no store caching.

Published cache flow:

- Fetch published homepage content with stable cache tags such as `page:home`.
- Fetch metadata with the same `page:home` tag or a narrower `page:home:seo` tag.
- Fetch globals with tags such as `global:header` and `global:footer`.
- Add a signed revalidation endpoint in `apps/web`.
- Payload `afterChange` hooks call the web endpoint after publish/update.
- Revalidate `/` for homepage edits.
- Revalidate global tags for header/footer edits.

Because `apps/web` and `apps/backend` are separate apps, Payload hooks cannot directly call `revalidatePath` inside the web app. Use a signed HTTP endpoint.

## Implementation phases

### Phase 1 - Schema foundation

- Add shared DTO/Zod contracts to `@mvp-realty/api-contracts`.
- Add reusable SEO fields and decide whether to install/extend `@payloadcms/plugin-seo`.
- Add Payload block configs.
- Add `Pages` collection.
- Add `Header` and `Footer` globals.
- Optionally add an `SEOSettings` global for site-wide defaults.
- Register new collection/globals in `payload.config.ts`.
- Run `pnpm -C apps/backend generate:types`.

### Phase 2 - Seed homepage content

Implemented locally by `apps/backend/src/scripts/seed-homepage.ts`, runnable with `pnpm -C apps/backend seed:homepage:local`.

- Upload or create equivalent media entries.
- Create or update the published `home` page document.
- Populate page SEO fields from the current hardcoded homepage metadata.
- Recreate current homepage section order in `layout`.
- Populate manual block data from existing hardcoded content.
- Create or update header and footer globals from current nav/footer constants.

### Phase 3 - Frontend data wiring

- Add CMS fetch helpers.
- Add metadata mapping helper.
- Convert homepage components to accept props.
- Add `CmsPageBlocksRenderer`.
- Add `generateMetadata` for the homepage from CMS SEO data.
- Replace the static homepage stack with CMS-driven layout rendering.
- Wire header/footer globals into root layout.
- Add media URL handling for Payload uploads.

### Phase 4 - Preview and revalidation

- Add signed preview route.
- Add signed revalidation route.
- Add Payload preview config.
- Add Payload `afterChange` hooks for pages and globals.
- Verify published and draft behavior.

### Phase 5 - Tests and verification

- Typecheck backend and web.
- Lint backend and web.
- Add focused tests for DTO parsing and block rendering fallbacks.
- Verify `/` still visually matches the current homepage.
- Verify missing/unknown block behavior.
- Verify header/footer render from globals.
- Verify SEO output for title, description, canonical, robots, Open Graph, Twitter, and JSON-LD.

## Open questions

- Should nav/footer global edits require drafts, or is direct publish acceptable?
- Should the first release keep static fallback content if Payload is unavailable?
- Should homepage dynamic sections stay manual until `communities` and `listings` collections exist?
- Do we want preview before the first CMS release, or can preview be phase two?
- Should media be moved to production storage now, or remain local until deployment planning?
- Should we install `@payloadcms/plugin-seo`, or implement `seo` fields manually for tighter control?
- Should site-wide SEO defaults live in a new `SEOSettings` global in the first implementation pass?
- Which advanced SEO fields should be visible by default versus collapsed behind an "Advanced" group?

## References

- Payload Blocks: https://payloadcms.com/docs/fields/blocks
- Payload Globals: https://payloadcms.com/docs/configuration/globals
- Payload Collections: https://payloadcms.com/docs/configuration/collections
- Payload Drafts: https://payloadcms.com/docs/versions/drafts
- Payload Local API: https://payloadcms.com/docs/local-api/overview
- Payload Select/defaultPopulate: https://payloadcms.com/docs/queries/select
- Payload SEO Plugin: https://payloadcms.com/docs/plugins/seo
- Next `generateMetadata`: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next Draft Mode: https://nextjs.org/docs/app/guides/draft-mode
- Next `revalidatePath`: https://nextjs.org/docs/app/api-reference/functions/revalidatePath
- Next `revalidateTag`: https://nextjs.org/docs/app/api-reference/functions/revalidateTag

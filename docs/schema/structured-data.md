# Structured data (schema.org / JSON-LD)

How this site describes itself to search engines. Every route emits a single
`<script type="application/ld+json">` containing one `@graph`, so a crawler sees
one connected set of entities rather than a pile of unrelated snippets.

Source lives in `apps/web/src/lib/seo/`.

## How the graph is put together

- **One graph per page.** `JsonLd` (`json-ld.tsx`) serializes an array of nodes
  into `{ "@context": "https://schema.org", "@graph": [...] }`.
- **Nodes reference each other by `@id`.** The organization and website are
  described once in the root layout; every other page points at them with a bare
  `{"@id": "…"}` instead of repeating the data. `ids.ts` owns the URI scheme.
- **Undefined fields are pruned** before serialization (`graph.ts`), so a missing
  MLS field never ships as `null` or an empty stub node.
- **Output is escaped** against `</script>` injection — see `graph.test.ts`.

### `@id` scheme

| Handle | Shape |
|---|---|
| Organization | `{origin}/#organization` |
| WebSite | `{origin}/#website` |
| Page | `{url}#webpage` |
| Breadcrumb | `{url}#breadcrumb` |
| Listing | `{origin}/listings/{slug}#listing` |
| Residence | `{origin}/listings/{slug}#residence` |
| Community place | `{origin}/communities/{slug}#place` |
| Agent | `{origin}/#agent-{slug}` |
| FAQ | `{community url}#faq` |

## Types by page

### Every page — root layout

| Type | Notes |
|---|---|
| `RealEstateAgent` | The brokerage. A `LocalBusiness` subtype, so it carries address, geo, opening hours and `priceRange` — which is what makes it eligible to consolidate with the Google Business Profile. License number rides in `identifier` (schema.org has no licence property). |
| `WebSite` | `publisher` → the organization. |

### Homepage `/`

| Type | Notes |
|---|---|
| `WebPage` | `about` → the organization. No breadcrumb — it is the root. |

### CMS pages `/[slug]`

| Type | Notes |
|---|---|
| `WebPage` or `ContactPage` | `ContactPage` for slugs `contact`, `contact-us`, `get-in-touch`. Both are the same entity, the subtype just narrows it. |
| `BreadcrumbList` | Home → page. |

### Listings index `/listings`

| Type | Notes |
|---|---|
| `CollectionPage` | Chosen over `SearchResultsPage`, which Google discourages indexing. |
| `ItemList` of `ListItem` | URLs only, not embedded listings — the detail pages describe themselves, and pointing at them invites the crawl instead of duplicating the data. |
| `BreadcrumbList` | Home → Residences. |

### Listing detail `/listings/[slug]`

| Type | Notes |
|---|---|
| `RealEstateListing` | Itself a `WebPage` subtype, so it doubles as the page node — **no separate `WebPage` is emitted, and nothing may reference a `#webpage` id on this route.** |
| `Offer` | Price, currency, availability. `seller` names the listing office when the home is another brokerage's inventory. |
| Residence node under `about` | Type varies by MLS property type (below). Carries `PostalAddress`, `GeoCoordinates`, bed/bath counts, `floorSize`, `yearBuilt`, `amenityFeature`. |
| `Person` | The broker, when present. |
| `BreadcrumbList` | Home → Residences → Community → Listing. The community crumb points at whatever href the page actually renders. |

MLS property type → schema type:

| MLS | schema.org |
|---|---|
| `single-family`, `townhouse` | `SingleFamilyResidence` |
| `condo` | `Apartment` |
| `multi-family` | `ApartmentComplex` |
| `villa` | `House` |
| `land` | `Place` — **not** an `Accommodation`, so bed/bath/floorSize/yearBuilt are omitted |
| `other` | `Residence` |

### Community detail `/communities/[slug]`

| Type | Notes |
|---|---|
| `WebPage` | `about` → the community place. `provider` → the covering agent. |
| `GatedResidenceCommunity` | A `Residence`, so still a `Place`. Address, `telephone`, `photo`, `amenityFeature`. |
| `ItemList` | Homes for sale in the community, as URLs. Omitted when empty. |
| `FAQPage` | Own node with a `#faq` id — an `FAQPage` and a `WebPage` cannot be the same entity. Omitted when the community has no FAQs. |
| `Person` | The broker, when present. |
| `BreadcrumbList` | Home → Community. Only two levels: there is no `/communities` index route, and a breadcrumb URL that 404s is worse than a short trail. |

## Deliberate choices

These look like omissions. They are not.

- **No `aggregateRating` or `Review` on communities.** Areas no longer carry a
  rating at all — the fields were dropped by the `drop_area_reviews` migration. Even
  while they existed this markup was deliberately omitted: review markup must
  describe first-party reviews of the marked-up item, and self-published ratings of a
  place you sell homes in are what manual actions are for. Do not add it if
  neighbourhood ratings ever come back. Broker ratings are a separate field and are
  also not marked up.
- **`dateModified`, not `datePosted`, on listings.** The feed gives a
  last-changed timestamp. Using it as a publication date would make every price
  change look like a fresh listing.
- **`coming-soon` maps to `PreOrder`, not `InStock`.** The home cannot be
  transacted yet, and that kind of mismatch gets structured data ignored
  wholesale.
- **Lot size uses `additionalProperty`.** `schema.org/lotSize` does not exist.
  A `PropertyValue` with `unitCode: FTK` keeps the figure machine-readable.
- **Brokers are `Person`, not `RealEstateAgent`.** `RealEstateAgent` is a
  `LocalBusiness` — an organization. `jobTitle` and `worksFor` are Person
  properties and would be invalid on it. The brokerage carries the
  `RealEstateAgent` signal; `worksFor` ties the two together.
- **Agents attach via `provider`, never `agent`.** `Place` has no `agent`
  property (`agent` only exists on `Action`), so the association lives on the
  page node.
- **`FAQPage` earns no rich result.** Since 2023 Google restricts FAQ rich
  results to government and health sites. It stays because it is valid and
  costs nothing, not because it wins a snippet.

## SEO coverage

| Page | Metadata | Canonical | OG image | Sitemap | JSON-LD |
|---|---|---|---|---|---|
| Homepage | yes | yes | generated | yes | yes |
| CMS `/[slug]` | yes | yes | from CMS | yes | yes |
| Listings index | yes | yes | root fallback | yes | yes |
| Listing detail | yes | yes | generated | yes | yes |
| Community detail | yes | yes | generated | yes | yes |
| `/privacy-policy` | yes | yes | root fallback | yes | no — legal page, no entity to mark up |
| `/ui` | metadata only — internal design reference | — | — | — | — |

`robots.ts` and `sitemap.ts` sit at `apps/web/src/app/`. **One sitemap holds every
URL** — pages, communities and listings. Listings were previously sharded under
`/listings/sitemap/<id>.xml` with an index; that was collapsed because nothing linked
the shards to `/sitemap.xml`, so the canonical sitemap appeared to contain no
properties. At ~220 URLs a single file is far inside the spec's 50,000 cap.

Re-split if inventory ever approaches that. Note the binding limit today is lower:
`fetchAllDocs` in `lib/cms/sitemap.ts` stops after `PAGE_LIMIT * MAX_PAGES` (20,000
docs per collection) and warns rather than truncating silently.

`/sitemap.xml` inherits the listings revalidate window (900s) because it is the
shortest of the three; a tag purge is the real invalidation.

Known gap: the listings index has no dedicated OG image and falls back to the
root one. Listing and community detail pages both generate their own.

## Changing this

Tests in `apps/web/src/lib/seo/*.test.ts` pin the decisions above — the Person
typing, the lot-size escape hatch, the land case, breadcrumb linkage, and the
absence of review markup. If a change makes one fail, confirm the vocabulary on
schema.org before editing the test.

Validate real output with the
[Rich Results Test](https://search.google.com/test/rich-results) and the
[Schema Markup Validator](https://validator.schema.org/).

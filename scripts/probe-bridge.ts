/**
 * Throwaway Phase 0 probe for Bridge Data Output.
 * Run from repo root after adding BRIDGE_API_TOKEN + BRIDGE_DATASET_ID
 * to apps/backend/.env:
 *
 *   node --experimental-strip-types scripts/probe-bridge.ts
 *
 * Prints non-secret findings only. Delete after the MLSAreaMajor strings
 * and field-population facts are recorded.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = 'https://api.bridgedataoutput.com/api/v2/OData';
/** NABOR MLSAreaMajor values are uppercase; filter with eq (contains over-matches cities). */
const TARGET_AREAS = [
  'BONITA BAY',
  'VALENCIA BONITA',
  'VALENCIA TRAILS',
  'BONITA SPRINGS',
  'FORT MYERS BEACH',
] as const;

const CITY_FILTERS = ['BONITA SPRINGS', 'FORT MYERS BEACH', 'NAPLES', 'ESTERO'] as const;

const MAPPED_FIELDS = [
  'ListingKey',
  'ListingId',
  'UnparsedAddress',
  'StreetNumber',
  'StreetName',
  'StreetSuffix',
  'UnitNumber',
  'City',
  'StateOrProvince',
  'PostalCode',
  'ListPrice',
  'BedroomsTotal',
  'BathroomsTotalDecimal',
  'LivingArea',
  'PropertySubType',
  'PropertyType',
  'MlsStatus',
  'StandardStatus',
  'MLSAreaMajor',
  'WaterfrontYN',
  'PoolPrivateYN',
  'AssociationAmenities',
  'CommunityFeatures',
  'SeniorCommunityYN',
  'YearBuilt',
  'LotSizeSquareFeet',
  'TaxAnnualAmount',
  'AssociationFee',
  'AssociationFeeFrequency',
  'PublicRemarks',
  'InteriorFeatures',
  'Appliances',
  'Flooring',
  'Heating',
  'Cooling',
  'LaundryFeatures',
  'Roof',
  'ConstructionMaterials',
  'ParkingFeatures',
  'PoolFeatures',
  'LotFeatures',
  'Sewer',
  'WaterSource',
  'ListAgentFullName',
  'ListOfficeName',
  'ModificationTimestamp',
] as const;

/** Parse a dotenv file into a local map — do not touch process.env (ESLint-restricted). */
function loadDotEnv(filePath: string): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!existsSync(filePath)) return vars;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (vars[key] === undefined) vars[key] = value;
  }
  return vars;
}

const fileEnv = loadDotEnv(resolve(process.cwd(), 'apps/backend/.env'));
const token = fileEnv.BRIDGE_API_TOKEN;
const datasetId = fileEnv.BRIDGE_DATASET_ID;

if (!token || !datasetId) {
  console.error(
    'Missing BRIDGE_API_TOKEN and/or BRIDGE_DATASET_ID.\n' +
      'Add them to apps/backend/.env, then re-run:\n' +
      '  node --experimental-strip-types scripts/probe-bridge.ts',
  );
  process.exit(1);
}

type ODataCollection<T> = {
  value?: T[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  [key: string]: unknown;
};

async function bridgeFetch(pathAndQuery: string): Promise<Response> {
  const url = pathAndQuery.startsWith('http')
    ? pathAndQuery
    : `${BASE}/${datasetId}/${pathAndQuery}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Bridge ${res.status} ${res.statusText} for ${url.replace(token!, '[redacted]')}\n${body.slice(0, 500)}`,
    );
  }
  return res;
}

async function bridgeJson<T>(pathAndQuery: string): Promise<T> {
  const res = await bridgeFetch(pathAndQuery);
  return (await res.json()) as T;
}

function odataString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function summarizeValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `array(len=${value.length}) e.g. ${JSON.stringify(value.slice(0, 3))}`;
  }
  if (typeof value === 'string') {
    const preview = value.length > 80 ? `${value.slice(0, 80)}…` : value;
    return `string(len=${value.length}) ${JSON.stringify(preview)}`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return `${typeof value}`;
}

async function collectDistinctMlsAreaMajor(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const cityOr = CITY_FILTERS.map((c) => `City eq ${odataString(c)}`).join(' or ');
  const filter = `(${cityOr}) and MlsStatus eq 'Active'`;
  let next: string | null =
    `Property?$filter=${encodeURIComponent(filter)}&$select=MLSAreaMajor&$top=200`;

  let pages = 0;
  const maxPages = 50; // safety cap (~10k rows) — enough to discover area strings

  while (next && pages < maxPages) {
    const data = await bridgeJson<ODataCollection<{ MLSAreaMajor?: string | null }>>(next);
    for (const row of data.value ?? []) {
      const area = row.MLSAreaMajor?.trim();
      if (!area) continue;
      counts.set(area, (counts.get(area) ?? 0) + 1);
    }
    next = data['@odata.nextLink'] ?? null;
    pages += 1;
    process.stderr.write(`  sampled page ${pages}, unique areas so far: ${counts.size}\n`);
  }

  return counts;
}

/** Exact MLSAreaMajor + Active. NABOR strings are uppercase; eq avoids city over-match. */
function areaActiveFilter(match: string): string {
  return `MLSAreaMajor eq ${odataString(match)} and MlsStatus eq 'Active'`;
}

async function countActiveForArea(match: string): Promise<number> {
  const data = await bridgeJson<ODataCollection<unknown>>(
    `Property?$filter=${encodeURIComponent(areaActiveFilter(match))}&$top=0&$count=true`,
  );
  return typeof data['@odata.count'] === 'number' ? data['@odata.count'] : 0;
}

async function probeTargetArea(
  target: string,
): Promise<{ match: string; filter: string; count: number; distinctValues: string[] }> {
  const filter = areaActiveFilter(target);
  const count = await countActiveForArea(target);

  // Sample which concrete MLSAreaMajor strings the contains filter hits
  const sample = await bridgeJson<ODataCollection<{ MLSAreaMajor?: string }>>(
    `Property?$filter=${encodeURIComponent(filter)}&$select=MLSAreaMajor&$top=50`,
  );
  const distinctValues = [
    ...new Set(
      (sample.value ?? [])
        .map((r) => r.MLSAreaMajor?.trim())
        .filter((v): v is string => Boolean(v)),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return { match: target, filter, count, distinctValues };
}

async function fetchOneFullListing(match: string): Promise<Record<string, unknown> | null> {
  // NABOR embeds Media on Property — do not $expand=Media (400 Invalid field).
  const select = [...MAPPED_FIELDS, 'Media', 'PhotosCount']
    .filter((f) => f !== 'AssociationFeeFrequency')
    .join(',');
  const data = await bridgeJson<ODataCollection<Record<string, unknown>>>(
    `Property?$filter=${encodeURIComponent(areaActiveFilter(match))}&$select=${select}&$top=1`,
  );
  return data.value?.[0] ?? null;
}

function printSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

async function main(): Promise<void> {
  console.log(`Dataset: ${datasetId}`);
  console.log('Token: [redacted]');

  printSection('1. Distinct MLSAreaMajor (sampled from SWFL cities, Active)');
  const discovered = await collectDistinctMlsAreaMajor();
  const sorted = [...discovered.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  console.log(`Unique values found: ${sorted.length}`);
  for (const [area, sampleCount] of sorted) {
    console.log(`  ${JSON.stringify(area)}  (sample hits: ${sampleCount})`);
  }

  // Highlight strings that look related to our targets
  printSection('1b. Discovered values matching target name fragments');
  for (const target of TARGET_AREAS) {
    const hits = sorted.filter(([k]) =>
      k.toLowerCase().includes(target.toLowerCase().split(' ')[0]!),
    );
    const related = sorted.filter(([k]) =>
      target
        .toLowerCase()
        .split(/\s+/)
        .every((word) => k.toLowerCase().includes(word)),
    );
    console.log(`\n  Target: ${target}`);
    if (related.length) {
      for (const [k, n] of related) console.log(`    related: ${JSON.stringify(k)} (${n})`);
    } else if (hits.length) {
      for (const [k, n] of hits.slice(0, 15))
        console.log(`    fragment: ${JSON.stringify(k)} (${n})`);
    } else {
      console.log('    (no sample hits)');
    }
  }

  printSection('2. Active listing counts per planned area (Bridge UI filter shape)');
  const resolved: Awaited<ReturnType<typeof probeTargetArea>>[] = [];
  for (const target of TARGET_AREAS) {
    const result = await probeTargetArea(target);
    resolved.push(result);
    console.log(`  ${target}`);
    console.log(`    $filter: ${result.filter}`);
    console.log(`    active count: ${result.count}`);
    console.log(
      `    distinct MLSAreaMajor hits: ${
        result.distinctValues.length
          ? result.distinctValues.map((v) => JSON.stringify(v)).join(', ')
          : '(none in sample)'
      }`,
    );
  }

  const listingArea =
    resolved.find((r) => r.count > 0)?.match ??
    sorted.find(([k]) => /bonita/i.test(k))?.[0] ??
    sorted[0]?.[0];

  printSection('3. One complete listing (mapped fields + population)');
  if (!listingArea) {
    console.log('No MLSAreaMajor available to sample a listing.');
  } else {
    console.log(`Using filter: ${areaActiveFilter(listingArea)}`);
    const listing = await fetchOneFullListing(listingArea);
    if (!listing) {
      console.log('No listing returned.');
    } else {
      console.log('\nField population:');
      for (const field of MAPPED_FIELDS) {
        console.log(`  ${field}: ${summarizeValue(listing[field])}`);
      }

      const media = listing.Media;
      printSection('4. Media array');
      if (!Array.isArray(media)) {
        console.log(`Media: ${summarizeValue(media)}`);
      } else {
        console.log(`Media count: ${media.length}`);
        const first = media[0] as Record<string, unknown> | undefined;
        if (first) {
          console.log('First Media keys:', Object.keys(first).sort().join(', '));
          for (const key of [
            'MediaKey',
            'MediaURL',
            'MediaURLHttps',
            'Order',
            'ShortDescription',
            'MimeType',
            'PreferredPhotoYN',
            'MediaCategory',
            'ResourceRecordKey',
          ]) {
            if (key in first) console.log(`  ${key}: ${summarizeValue(first[key])}`);
          }
          // Redact full URL host path beyond origin for safety in logs committed later
          const url = typeof first.MediaURL === 'string' ? first.MediaURL : null;
          if (url) {
            try {
              const u = new URL(url);
              console.log(`  MediaURL origin: ${u.origin}`);
              console.log(`  MediaURL path sample: ${u.pathname.slice(0, 60)}…`);
            } catch {
              console.log('  MediaURL: (unparseable)');
            }
          }
        }
        if (media.length > 1) {
          const second = media[1] as Record<string, unknown>;
          console.log(
            `Second Media order/key: order=${summarizeValue(second.Order)} key=${summarizeValue(second.MediaKey)}`,
          );
        }
      }

      // Dump raw keys present on the record (helps spot unexpected field names)
      printSection('3b. All keys on sample listing');
      console.log(Object.keys(listing).sort().join(', '));
    }
  }

  printSection('Suggested mlsAreaMajor seed values (contains match string)');
  for (const row of resolved) {
    const note =
      row.count === 0
        ? 'TODO — zero results (wrong string?)'
        : row.distinctValues.length > 1
          ? `hits multiple: ${row.distinctValues.join(' | ')}`
          : 'ok';
    console.log(`  ${row.match}: ${JSON.stringify(row.match)}  // ${row.count} active — ${note}`);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

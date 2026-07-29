import type { BridgeODataCollection, BridgeProperty } from './types';

const DEFAULT_BASE = 'https://api.bridgedataoutput.com/api/v2/OData';

/** Fields needed by the mapper. Media is embedded on NABOR — never $expand. */
const PROPERTY_SELECT = [
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
  'Latitude',
  'Longitude',
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
  'PhotosCount',
  'Media',
].join(',');

export class BridgeClientError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'BridgeClientError';
    this.status = status;
  }
}

export type BridgeClientOptions = {
  token: string;
  datasetId: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  pageSize?: number;
  sleep?: (ms: number) => Promise<void>;
};

export type FetchAreaOptions = {
  /** ISO timestamp — only listings with ModificationTimestamp greater than this. */
  modifiedSince?: string;
};

function odataString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class BridgeClient {
  private readonly token: string;
  private readonly datasetId: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly pageSize: number;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(options: BridgeClientOptions) {
    this.token = options.token;
    this.datasetId = options.datasetId;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.maxRetries = options.maxRetries ?? 5;
    this.pageSize = options.pageSize ?? 200;
    this.sleep = options.sleep ?? defaultSleep;
  }

  async fetchActiveListingsForArea(
    mlsAreaMajor: string,
    options: FetchAreaOptions = {},
  ): Promise<BridgeProperty[]> {
    const filters = [`MLSAreaMajor eq ${odataString(mlsAreaMajor)}`, `MlsStatus eq 'Active'`];
    if (options.modifiedSince) {
      filters.push(`ModificationTimestamp gt ${options.modifiedSince}`);
    }

    const filter = filters.join(' and ');
    let next: string | null =
      `Property?$filter=${encodeURIComponent(filter)}` +
      `&$select=${PROPERTY_SELECT}` +
      `&$top=${this.pageSize}` +
      `&$orderby=ModificationTimestamp asc`;

    const rows: BridgeProperty[] = [];

    while (next) {
      const page: BridgeODataCollection<BridgeProperty> =
        await this.request<BridgeODataCollection<BridgeProperty>>(next);
      rows.push(...(page.value ?? []));
      next = page['@odata.nextLink'] ?? null;
    }

    return rows;
  }

  async countActiveListingsForArea(mlsAreaMajor: string): Promise<number> {
    const filter = `MLSAreaMajor eq ${odataString(mlsAreaMajor)} and MlsStatus eq 'Active'`;
    const path = `Property?$filter=${encodeURIComponent(filter)}&$top=0&$count=true`;
    const page = await this.request<BridgeODataCollection<BridgeProperty>>(path);
    return typeof page['@odata.count'] === 'number' ? page['@odata.count'] : 0;
  }

  private async request<T>(pathOrUrl: string): Promise<T> {
    const url = pathOrUrl.startsWith('http')
      ? pathOrUrl
      : `${this.baseUrl}/${this.datasetId}/${pathOrUrl}`;

    let attempt = 0;
    while (true) {
      const response = await this.fetchImpl(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt >= this.maxRetries) {
        const body = await response.text();
        throw new BridgeClientError(
          `Bridge ${response.status} for ${url}: ${body.slice(0, 300)}`,
          response.status,
        );
      }

      const retryAfterHeader = response.headers.get('Retry-After');
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
      const backoffMs = Number.isFinite(retryAfterSeconds)
        ? Math.max(0, retryAfterSeconds * 1000)
        : Math.min(30_000, 500 * 2 ** attempt);

      attempt += 1;
      await this.sleep(backoffMs);
    }
  }
}

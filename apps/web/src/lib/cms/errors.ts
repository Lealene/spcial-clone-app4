export type CmsDataErrorKind =
  | 'request-failed'
  | 'invalid-response'
  | 'missing-required-content'
  | 'no-renderable-blocks';

type CmsDataErrorOptions = {
  kind: CmsDataErrorKind;
  resource: string;
  status?: number;
  cause?: unknown;
};

export class CmsDataError extends Error {
  readonly kind: CmsDataErrorKind;
  readonly resource: string;
  readonly status?: number;

  constructor(message: string, options: CmsDataErrorOptions) {
    super(message, { cause: options.cause });
    this.name = 'CmsDataError';
    this.kind = options.kind;
    this.resource = options.resource;
    this.status = options.status;
  }
}

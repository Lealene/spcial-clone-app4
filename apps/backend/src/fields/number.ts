import type { Validate } from 'payload';

export const integerValidator: Validate = (value) =>
  value === undefined || value === null || (typeof value === 'number' && Number.isInteger(value))
    ? true
    : 'Enter a whole number.';

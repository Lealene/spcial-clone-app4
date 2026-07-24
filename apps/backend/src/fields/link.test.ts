import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { anchorIdField } from './anchorId';
import { ctaField } from './cta';
import { linkField } from './link';

type Validator = (
  value: unknown,
  args: { siblingData?: Record<string, unknown> },
) => unknown | Promise<unknown>;

function groupFields(field: Field): Field[] {
  if (field.type !== 'group') throw new Error('Expected a group field.');
  return field.fields;
}

function fieldByName(fields: Field[], name: string): Field {
  const field = fields.find((candidate) => 'name' in candidate && candidate.name === name);
  if (!field) throw new Error(`Missing field: ${name}`);
  return field;
}

function validator(field: Field): Validator {
  if (!('validate' in field) || typeof field.validate !== 'function') {
    throw new Error('Expected a field validator.');
  }
  return field.validate as Validator;
}

function validationResult(
  validate: Validator,
  value: unknown,
  siblingData?: Record<string, unknown>,
): Promise<unknown> {
  return Promise.resolve(validate(value, { siblingData }));
}

describe('Payload link fields', () => {
  it('allows a completely empty optional link but validates partial input', async () => {
    const fields = groupFields(linkField());
    const validateCustomUrl = validator(fieldByName(fields, 'customUrl'));

    await expect(validationResult(validateCustomUrl, '', { type: 'custom' })).resolves.toBe(true);
    await expect(
      validationResult(validateCustomUrl, '', { type: 'custom', label: 'Started link' }),
    ).resolves.toBe('Enter a safe app-relative or HTTP(S) URL.');
  });

  it('requires safe selected targets for required links', async () => {
    const fields = groupFields(linkField({ required: true }));
    const validateCustomUrl = validator(fieldByName(fields, 'customUrl'));
    const validateAnchor = validator(fieldByName(fields, 'anchor'));
    const validatePhone = validator(fieldByName(fields, 'phone'));

    await expect(
      validationResult(validateCustomUrl, 'javascript:alert(1)', { type: 'custom' }),
    ).resolves.toBe('Enter a safe app-relative or HTTP(S) URL.');
    await expect(
      validationResult(validateCustomUrl, '/listings', { type: 'custom' }),
    ).resolves.toBe(true);
    await expect(validationResult(validateAnchor, '#bad anchor', { type: 'anchor' })).resolves.toBe(
      'Enter an anchor such as #lead or /#lead.',
    );
    await expect(validationResult(validateAnchor, '/#lead', { type: 'anchor' })).resolves.toBe(
      true,
    );
    await expect(validationResult(validatePhone, 'abc', { type: 'phone' })).resolves.toBe(
      'Enter a phone number with at least seven digits.',
    );
    await expect(
      validationResult(validatePhone, '(239) 555-0148', { type: 'phone' }),
    ).resolves.toBe(true);
  });

  it('keeps CTA outer copy canonical and hides duplicate nested copy fields', () => {
    const fields = groupFields(ctaField({ required: true }));
    const nestedLink = fieldByName(fields, 'link');
    const nestedFields = groupFields(nestedLink);

    expect(fieldByName(fields, 'label')).toMatchObject({ required: true });
    expect(fieldByName(nestedFields, 'label')).toMatchObject({ admin: { hidden: true } });
    expect(fieldByName(nestedFields, 'ariaLabel')).toMatchObject({ admin: { hidden: true } });
  });

  it('validates reusable section anchor IDs', async () => {
    const validateAnchorId = validator(anchorIdField());

    await expect(validationResult(validateAnchorId, 'featured-listings')).resolves.toBe(true);
    await expect(validationResult(validateAnchorId, '#bad anchor')).resolves.toBe(
      'Use a plain section ID beginning with a letter and containing only letters, numbers, _ or -.',
    );
  });
});

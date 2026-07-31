import { describe, expect, it } from 'vitest';

import { prune, serializeJsonLd } from './graph';

describe('prune', () => {
  it('drops undefined, null and empty values', () => {
    expect(
      prune({ a: 1, b: undefined, c: null, d: '', e: [], f: {}, g: 0, h: false }),
    ).toStrictEqual({ a: 1, g: 0, h: false });
  });

  it('drops nodes reduced to nothing but a @type', () => {
    expect(
      prune({ keep: 'x', geo: { '@type': 'GeoCoordinates', latitude: undefined } }),
    ).toStrictEqual({ keep: 'x' });
  });

  it('prunes nested objects inside arrays', () => {
    expect(prune({ items: [{ name: 'a', alt: undefined }] })).toStrictEqual({
      items: [{ name: 'a' }],
    });
  });
});

describe('serializeJsonLd', () => {
  it('wraps nodes in a schema.org @graph', () => {
    const json = JSON.parse(serializeJsonLd([{ '@type': 'WebPage', name: 'Home' }]));
    expect(json['@context']).toBe('https://schema.org');
    expect(json['@graph']).toStrictEqual([{ '@type': 'WebPage', name: 'Home' }]);
  });

  it('escapes characters that could break out of the script tag', () => {
    const output = serializeJsonLd([{ '@type': 'WebPage', name: '</script><img>' }]);
    expect(output).not.toContain('</script>');
    expect(output).not.toContain('<');
    expect(output).not.toContain('>');
    // Still valid JSON — the escapes are inside string literals.
    expect(JSON.parse(output)['@graph'][0].name).toBe('</script><img>');
  });
});

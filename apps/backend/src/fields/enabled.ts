import type { Field } from 'payload';

export function enabledField(): Field {
  return {
    name: 'enabled',
    type: 'checkbox',
    defaultValue: true,
    admin: {
      description: 'Disable to keep this block in the page without rendering it.',
    },
  };
}

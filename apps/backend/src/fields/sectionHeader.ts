import type { Field } from 'payload';

type SectionHeaderFieldOptions = {
  name?: string;
  label?: string;
  includeAnchor?: boolean;
};

export function sectionHeaderField({
  name = 'header',
  label = 'Section header',
  includeAnchor = false,
}: SectionHeaderFieldOptions = {}): Field {
  return {
    name,
    type: 'group',
    label,
    fields: [
      ...(includeAnchor
        ? [
            {
              name: 'anchorId',
              type: 'text' as const,
              admin: {
                description: 'Plain section ID without #, for example communities.',
              },
            },
          ]
        : []),
      {
        name: 'kicker',
        type: 'text',
        required: true,
      },
      {
        name: 'heading',
        type: 'text',
        required: true,
      },
      {
        name: 'headingAccent',
        type: 'text',
        admin: {
          description: 'Optional phrase rendered with the existing emphasized style.',
        },
      },
      {
        name: 'lede',
        type: 'textarea',
      },
    ],
  };
}

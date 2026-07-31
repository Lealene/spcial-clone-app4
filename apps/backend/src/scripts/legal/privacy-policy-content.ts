/**
 * Starting skeleton for the `privacy-policy` global.
 *
 * IMPORTANT: this is a structural placeholder, not legal advice and not a policy
 * anyone may publish as-is. The section list follows what a Florida brokerage site
 * with an IDX/MLS feed and lead-capture forms typically has to disclose, but every
 * paragraph marked [REVIEW] must be replaced with text MVP Realty's counsel has
 * approved. Do not paste another brokerage's policy in here — it is their
 * copyrighted text and it names their entity, licenses and privacy contact.
 */

type TextNode = {
  type: 'text';
  detail: 0;
  format: number;
  mode: 'normal';
  style: '';
  text: string;
  version: 1;
};

type ElementNode = {
  type: 'paragraph' | 'heading' | 'list' | 'listitem';
  children: (TextNode | ElementNode)[];
  direction: 'ltr';
  format: '';
  indent: 0;
  version: 1;
  tag?: string;
  listType?: 'bullet' | 'number';
  start?: number;
  value?: number;
};

export type LexicalDoc = {
  root: {
    type: 'root';
    children: ElementNode[];
    direction: 'ltr';
    format: '';
    indent: 0;
    version: 1;
  };
};

const base = { direction: 'ltr', format: '', indent: 0, version: 1 } as const;

function textNode(text: string): TextNode {
  return { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 };
}

function paragraph(text: string): ElementNode {
  return { type: 'paragraph', children: [textNode(text)], ...base };
}

function heading(text: string): ElementNode {
  return { type: 'heading', tag: 'h2', children: [textNode(text)], ...base };
}

function bulletList(items: string[]): ElementNode {
  return {
    type: 'list',
    listType: 'bullet',
    start: 1,
    children: items.map((item, index) => ({
      type: 'listitem' as const,
      value: index + 1,
      children: [textNode(item)],
      ...base,
    })),
    ...base,
  };
}

const REVIEW = '[REVIEW] ';

const SECTIONS: { heading: string; body: (string | string[])[] }[] = [
  {
    heading: 'Information we collect',
    body: [
      `${REVIEW}We collect information you give us directly and information collected automatically when you use the site.`,
      [
        'Contact details you submit through a form — name, email, phone, and any message.',
        'Property preferences, saved searches, and saved listings.',
        'Device and usage data such as IP address, browser, pages viewed, and referring URL.',
        'Cookie and analytics identifiers, described below.',
      ],
    ],
  },
  {
    heading: 'How we use your information',
    body: [
      `${REVIEW}We use the information to respond to enquiries, present properties that match your stated interests, operate and secure the site, and meet our record-keeping obligations as a licensed brokerage.`,
    ],
  },
  {
    heading: 'MLS and IDX listing data',
    body: [
      `${REVIEW}Listing content on this site is provided through an MLS/IDX feed and remains subject to the rules of the originating MLS. Listing data is not your personal information, but your interactions with it — searches, saves, enquiries — are covered by this policy.`,
    ],
  },
  {
    heading: 'Cookies and analytics',
    body: [
      `${REVIEW}We use cookies and similar technologies for essential site function and for measurement. Describe each analytics or advertising tool actually in use, and how a visitor can opt out.`,
    ],
  },
  {
    heading: 'How we share information',
    body: [
      `${REVIEW}We share information with service providers who operate the site and our CRM on our behalf, with affiliated agents handling your enquiry, and where required by law. We do not sell personal information.`,
    ],
  },
  {
    heading: 'Calls, texts, and marketing consent',
    body: [
      `${REVIEW}If you submit a form requesting contact, you consent to be contacted at the number provided, including by SMS where indicated. Message frequency varies and data rates may apply. Describe the exact opt-out mechanism, e.g. replying STOP.`,
    ],
  },
  {
    heading: 'Your choices and rights',
    body: [
      `${REVIEW}Explain how a visitor may request access to, correction of, or deletion of their information, how to unsubscribe from marketing, and any state-specific rights that apply to your visitors.`,
    ],
  },
  {
    heading: 'Data retention and security',
    body: [
      `${REVIEW}We keep personal information only as long as needed for the purposes above or as required by law, and we use reasonable administrative and technical safeguards. No method of transmission over the internet is completely secure.`,
    ],
  },
  {
    heading: "Children's privacy",
    body: [
      `${REVIEW}This site is not directed to children under 13, and we do not knowingly collect their personal information.`,
    ],
  },
  {
    heading: 'Changes to this policy',
    body: [
      `${REVIEW}We may update this policy from time to time. The "last updated" date above reflects the most recent revision.`,
    ],
  },
  {
    heading: 'Contact us',
    body: [
      `${REVIEW}Add the brokerage's legal name, mailing address, phone number, and the email address that receives privacy requests.`,
    ],
  },
];

export const PRIVACY_POLICY_TITLE = 'Privacy Policy';

export const PRIVACY_POLICY_INTRO =
  '[REVIEW] This policy explains what information MVP Realty collects through this website, how we use it, and the choices you have. Replace this paragraph with counsel-approved wording before publishing.';

export function privacyPolicyBody(): LexicalDoc {
  const children: ElementNode[] = [];

  for (const section of SECTIONS) {
    children.push(heading(section.heading));
    for (const block of section.body) {
      children.push(Array.isArray(block) ? bulletList(block) : paragraph(block));
    }
  }

  return { root: { type: 'root', children, ...base } };
}

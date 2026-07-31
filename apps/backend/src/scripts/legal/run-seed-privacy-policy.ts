import { getPayload } from 'payload';

import config from '@payload-config';

import {
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_TITLE,
  privacyPolicyBody,
} from './privacy-policy-content';

/**
 * Populates the `privacy-policy` global with the placeholder skeleton so the route
 * renders before counsel supplies final text. Overwrites the body on every run — do
 * not run it against production once real wording is in place.
 */
const payload = await getPayload({ config });

await payload.updateGlobal({
  slug: 'privacy-policy',
  data: {
    title: PRIVACY_POLICY_TITLE,
    intro: PRIVACY_POLICY_INTRO,
    body: privacyPolicyBody(),
  },
});

payload.logger.info({
  msg: 'Privacy policy global seeded with the placeholder skeleton. Replace every [REVIEW] paragraph before publishing.',
});

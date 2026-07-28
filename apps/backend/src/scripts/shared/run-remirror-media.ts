import { getPayload } from 'payload';

import config from '@payload-config';

import { remirrorCommunityMedia } from '../communities/remirror-media';
import { remirrorHomepageMedia } from '../homepage/remirror-media';
import { assertPublicMediaUrls } from './assert-public-media-urls';

const target = process.argv[2];
if (target !== 'homepage' && target !== 'communities') {
  throw new Error(
    'Usage: payload run src/scripts/shared/run-remirror-media.ts <homepage|communities>',
  );
}

const payload = await getPayload({ config });
const result =
  target === 'homepage'
    ? await remirrorHomepageMedia(payload)
    : await remirrorCommunityMedia(payload);

payload.logger.info({
  msg: `${target === 'homepage' ? 'Homepage' : 'Community'} seed media remirror complete.`,
  updatedCount: result.updated.length,
  createdCount: result.created.length,
  missingCount: result.missing.length,
  updated: result.updated,
  created: result.created,
  missing: result.missing,
});

await assertPublicMediaUrls(payload, result.updated);

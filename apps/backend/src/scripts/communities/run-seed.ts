import { getPayload, type PayloadRequest } from 'payload';

import config from '@payload-config';

import { seedAreas } from '../areas/seed';
import { attachAreaBrokers, attachBrokerHeadshot, seedBrokers } from '../brokers/seed';
import { hasS3StorageConfig } from '../../env';
import { reconcileHomepageSeedMedia } from '../homepage/media';
import { reconcileCommunitySeedMedia } from './media';
import { remirrorCommunityMedia } from './remirror-media';
import { attachSimilarAreas, seedCommunityContent } from './seed-content';

const payload = await getPayload({ config });

// Media uploads stay outside the transaction (file I/O + external storage).
const homepageMedia = await reconcileHomepageSeedMedia(payload);
const communityMedia = await reconcileCommunitySeedMedia(payload);

// Payload create/file can skip the S3 adapter write; PutObject so R2 URLs resolve.
if (hasS3StorageConfig()) {
  await remirrorCommunityMedia(payload);
}

const transactionID = await payload.db.beginTransaction();
if (transactionID === null || transactionID === undefined) {
  throw new Error('Failed to begin community seed transaction.');
}

const req = { transactionID } as Pick<PayloadRequest, 'transactionID'>;

try {
  const areas = await seedAreas(payload, { req });
  const brokers = await seedBrokers(payload, { req });
  const headshots = await attachBrokerHeadshot(
    payload,
    { headshotMediaId: homepageMedia.mediaDocs.owner.id },
    { req },
  );
  const areaBrokers = await attachAreaBrokers(payload, { req });
  const content = await seedCommunityContent(
    payload,
    {
      communityMedia: communityMedia.mediaDocs,
      homepageMedia: {
        bonitaBay: homepageMedia.mediaDocs.bonitaBay,
        valenciaBonita: homepageMedia.mediaDocs.valenciaBonita,
        valenciaTrails: homepageMedia.mediaDocs.valenciaTrails,
      },
    },
    { req },
  );
  const similar = await attachSimilarAreas(payload, { req });

  await payload.db.commitTransaction(transactionID);

  payload.logger.info({
    msg: 'Community seed complete.',
    areas,
    brokers,
    headshotsAttached: headshots,
    areaBrokersAttached: areaBrokers,
    content,
    similarAttached: similar,
    homepageMediaCreated: homepageMedia.created,
    communityMediaCreated: communityMedia.created,
  });
} catch (error) {
  await payload.db.rollbackTransaction(transactionID);
  throw error;
}

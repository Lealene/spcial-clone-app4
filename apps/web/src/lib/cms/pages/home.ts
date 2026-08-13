import type { CmsPage } from '@mvp-realty/api-contracts';
import { connection } from 'next/server';

import { homepageFixture } from '@/data/homepage-fixture';

import { CmsDataError, isCmsAvailabilityError } from '../errors';
import { getPageContent } from './index';

export async function getHomePageContent(): Promise<CmsPage> {
  try {
    const result = await getPageContent('home');
    if (result.status === 'missing') {
      throw new CmsDataError('The required CMS homepage is missing.', {
        kind: 'missing-required-content',
        resource: 'page:home',
      });
    }
    return result.page;
  } catch (error) {
    if (!isCmsAvailabilityError(error)) throw error;

    // Do not persist an outage snapshot as an ISR artifact.
    await connection();
    return homepageFixture;
  }
}

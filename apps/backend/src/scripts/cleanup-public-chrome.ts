import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';
import { getPayload } from 'payload';

import config from '@payload-config';

import { DISABLE_REVALIDATE, revalidateWebTags } from '../hooks/revalidate';

async function main(): Promise<void> {
  const apply = process.argv.includes('apply');
  const payload = await getPayload({ config });

  try {
    const footer = await payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: true });
    const hasSplitLegacyBrand =
      footer.brandName.trim().toLowerCase() === 'mvp' &&
      footer.brandAccentText?.trim().toLowerCase() === 'realty';

    payload.logger.info({
      apply,
      footerId: footer.id,
      hasSplitLegacyBrand,
      msg: 'Public chrome cleanup inspected the footer identity fields.',
    });

    if (!apply || !hasSplitLegacyBrand) return;

    await payload.updateGlobal({
      slug: 'footer',
      data: { brandName: '55 Living Team', brandAccentText: '' },
      context: { [DISABLE_REVALIDATE]: true },
      overrideAccess: true,
    });
    await revalidateWebTags(payload, [CMS_CACHE_TAGS.all]);
  } finally {
    await payload.destroy();
  }
}

await main();

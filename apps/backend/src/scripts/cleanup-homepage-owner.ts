import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';
import { getPayload } from 'payload';

import config from '@payload-config';

import { DISABLE_REVALIDATE, revalidateWebTags } from '../hooks/revalidate';

const expectedPortraitAlt =
  'Portrait of Kim Noble, Senior Real Estate Specialist, with her Doberman';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPlaceholderCredential(value: unknown): boolean {
  if (!isRecord(value)) return false;

  const credentialValue = typeof value.value === 'string' ? value.value.trim() : '';
  const credentialLabel = typeof value.label === 'string' ? value.label.trim() : '';
  return (
    credentialValue.length > 0 && /^[*]+$/.test(credentialValue) && /^[*]+$/.test(credentialLabel)
  );
}

async function main(): Promise<void> {
  const apply = process.argv.includes('apply');
  const payload = await getPayload({ config });

  try {
    const result = await payload.find({
      collection: 'pages',
      depth: 2,
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: 'home' } },
    });
    const homepage = result.docs[0];
    if (!homepage) throw new Error('Published homepage was not found.');

    let portraitMediaId: number | string | undefined;
    let removedCredentials = 0;
    const layout = homepage.layout.map((block) => {
      if (block.blockType !== 'ownerIntro') return block;

      const image = block.portrait?.image;
      portraitMediaId = typeof image === 'object' && image ? image.id : image;
      const credentials = block.credentials ?? [];
      const nextCredentials = credentials.filter((credential) => {
        const placeholder = isPlaceholderCredential(credential);
        if (placeholder) removedCredentials += 1;
        return !placeholder;
      });

      return { ...block, credentials: nextCredentials };
    });

    payload.logger.info({
      apply,
      homepageId: homepage.id,
      msg: 'Homepage owner cleanup inspected the current document.',
      portraitMediaId,
      removedCredentials,
    });

    if (!apply) return;
    if (removedCredentials > 0) {
      await payload.update({
        collection: 'pages',
        id: homepage.id,
        data: { layout },
        draft: false,
        context: { [DISABLE_REVALIDATE]: true },
        overrideAccess: true,
      });
    }

    if (portraitMediaId !== undefined) {
      await payload.update({
        collection: 'media',
        id: portraitMediaId,
        data: { alt: expectedPortraitAlt },
        context: { [DISABLE_REVALIDATE]: true },
        overrideAccess: true,
      });
    }

    await revalidateWebTags(payload, [CMS_CACHE_TAGS.all]);
  } finally {
    await payload.destroy();
  }
}

await main();

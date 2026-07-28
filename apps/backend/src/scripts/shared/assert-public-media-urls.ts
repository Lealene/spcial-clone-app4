import type { Payload } from 'payload';

type RemirrorMediaItem = {
  key: string;
  id: number;
  url: string | null | undefined;
};

/** Fail the CLI if remirrored objects are missing a readable public URL. */
export async function assertPublicMediaUrls(
  payload: Payload,
  items: RemirrorMediaItem[],
): Promise<void> {
  for (const item of items) {
    if (!item.url) {
      throw new Error(`Media ${item.key} (#${item.id}) has no URL after remirror.`);
    }

    try {
      const response = await fetch(item.url);
      payload.logger.info({
        msg: 'Public media URL check',
        key: item.key,
        status: response.status,
        url: item.url,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Media ${item.key} uploaded but public URL is not readable (${reason}): ${item.url}. Check R2 bucket public access and S3_PUBLIC_URL.`,
      );
    }
  }
}

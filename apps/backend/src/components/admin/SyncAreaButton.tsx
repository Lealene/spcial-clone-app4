'use client';

import { Button, toast, useDocumentInfo } from '@payloadcms/ui';
import { useState } from 'react';

export default function SyncAreaButton() {
  const { data, id } = useDocumentInfo();
  const [pending, setPending] = useState(false);
  const slug = typeof data?.slug === 'string' ? data.slug : undefined;

  if (!id || !slug) return null;

  const onClick = async () => {
    setPending(true);
    try {
      const response = await fetch('/api/bridge/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ areaSlug: slug, full: true }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        status?: string;
        syncLogId?: string | number;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error || `Sync failed (${response.status})`);
      }
      toast.success(`Synced ${slug}: ${json.status} (log #${json.syncLogId})`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <Button buttonStyle="secondary" disabled={pending} onClick={() => void onClick()}>
      {pending ? 'Syncing…' : 'Full sync this area'}
    </Button>
  );
}

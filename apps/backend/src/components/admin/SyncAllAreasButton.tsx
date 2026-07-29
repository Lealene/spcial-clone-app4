'use client';

import { Button, toast } from '@payloadcms/ui';
import { useState } from 'react';

export default function SyncAllAreasButton() {
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    setPending(true);
    try {
      const response = await fetch('/api/bridge/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
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
      toast.success(`Sync finished: ${json.status} (log #${json.syncLogId})`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Button buttonStyle="secondary" disabled={pending} onClick={() => void onClick()}>
        {pending ? 'Syncing…' : 'Sync all areas'}
      </Button>
    </div>
  );
}

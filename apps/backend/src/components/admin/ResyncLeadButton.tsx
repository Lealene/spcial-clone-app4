'use client';

import { Button, toast, useDocumentInfo } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Retry this lead's Wise Agent sync. Rendered as a UI field inside the CRM
 * group, and only when the sync failed — see the `condition` on the field.
 */
export default function ResyncLeadButton() {
  const { id } = useDocumentInfo();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!id) return null;

  const onClick = async () => {
    setPending(true);
    try {
      const response = await fetch(`/api/leads/${id}/resync`, {
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
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error || `Retry failed (${response.status})`);
      }
      if (json.status === 'synced') {
        toast.success('Lead sent to Wise Agent.');
      } else if (json.status === 'skipped') {
        toast.error('No mail transport or Wise Agent address is configured.');
      } else {
        throw new Error(json.error || 'Wise Agent sync failed again.');
      }
      // Pull the updated crm group back in so status/error/syncedAt reflect the retry.
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Retry failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Button buttonStyle="secondary" disabled={pending} onClick={() => void onClick()}>
        {pending ? 'Retrying…' : 'Retry Wise Agent sync'}
      </Button>
    </div>
  );
}

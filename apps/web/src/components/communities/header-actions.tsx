'use client';

import { SaveShareActions } from '@/components/save-share-actions';

/** Community detail Save / Share — shared control with listing PDP. */
export function HeaderActions({ name, slug }: { name: string; slug: string }) {
  return <SaveShareActions kind="community" name={name} slug={slug} />;
}

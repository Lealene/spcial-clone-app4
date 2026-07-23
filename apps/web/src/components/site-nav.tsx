import type { HeaderGlobal } from '@mvp-realty/api-contracts';

import { SiteNavInteractive } from './site-nav-interactive';

export function SiteNav({ header }: { header: HeaderGlobal }) {
  return <SiteNavInteractive header={header} />;
}

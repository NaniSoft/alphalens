import type { ReactElement } from 'react';

import { SiteChrome } from '@/components/SiteChrome';
import { Landing } from '@/components/Landing';

export default function HomePage(): ReactElement {
  return (
    <SiteChrome>
      <Landing />
    </SiteChrome>
  );
}

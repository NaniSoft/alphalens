import type { ReactElement } from 'react';

import { NotFoundPage } from '@nanisoft/prism-ui/pages/not-found-page';

import { SiteChrome } from '@/components/SiteChrome';

/**
 * The not-found screen, from the design system's Page for it.
 *
 * The code is the `h1` and the sentence is the headline under it, which is the reverse
 * of what a reader sees first and the right way round for anything that reads the
 * outline: a page whose `h1` is "Page not found" gives a search engine and a screen
 * reader nothing distinct to index. Three ways out rather than none, because the
 * retired screen had no link at all and a dead end with a message on it is not a
 * not-found page.
 *
 * **It gets the bar, and no link in it is current.** A 404 is not one of this site's
 * three destinations, so `current` is left off and the reader's bar is the one they
 * arrived with. The chrome moved out of the root layout, so this page is one of the
 * places that has to say that explicitly rather than inheriting it.
 */
export default function NotFound(): ReactElement {
  return (
    <SiteChrome>
      <NotFoundPage
        code="404"
        title="This page does not exist (yet)."
        links={[
          { label: 'AlphaLens', href: '/' },
          { label: 'Docs', href: '/docs' },
          { label: 'Blog', href: '/blog' },
        ]}
        linksLabel="Ways out"
      />
    </SiteChrome>
  );
}

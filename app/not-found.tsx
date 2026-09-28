import type { ReactElement } from 'react';

import { NotFoundPage } from '@nanisoft/prism-ui/pages/not-found-page';

/**
 * The not-found screen, from the design system's Page for it.
 *
 * The code is the `h1` and the sentence is the headline under it, which is the reverse
 * of what a reader sees first and the right way round for anything that reads the
 * outline: a page whose `h1` is "Page not found" gives a search engine and a screen
 * reader nothing distinct to index. Three ways out rather than none, because the
 * retired screen had no link at all and a dead end with a message on it is not a
 * not-found page.
 */
export default function NotFound(): ReactElement {
  return (
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
  );
}

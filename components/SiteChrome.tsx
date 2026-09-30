import type { ReactNode } from 'react';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar';

import {
  BAR_DEFAULT_MODE,
  BAR_DEFAULT_PACK,
  BAR_PRODUCT,
  COPY,
  CURRENT_SITE_ID,
  FOOTER_COLUMNS,
  NAV,
  SITES,
} from '@/lib/bar';

/**
 * The chrome, in one place, and the reason it is not in the root layout.
 *
 * **A server render knows the route; a root layout does not.** This bar used to live
 * in `app/layout.tsx`, which is rendered once per route and is handed no pathname, so
 * none of the three destinations could ever be marked as the page the reader was on.
 * The Block offers two ways out of that and this one takes the first: the page sets
 * `current` on the link it is serving, the flag is a prop, and nothing became a client
 * component to get it. The second way is `currentPath`, which resolves the mark in the
 * browser, and this site already has one client boundary for its own reasons; taking the
 * first way is what stopped the bar from needing a second.
 *
 * **The bar is the design system's, and its client boundary is inside the package.**
 * Search, the menu of the family's five sites, the light and dark control and the panel
 * below the row's threshold are four pieces of reader state, and they are one client
 * island in `@nanisoft/prism-ui` rather than lines in this repository. This site's own
 * one client component is `components/RevealRoot.tsx` and it is still the only one:
 * `test/no-scripting.test.tsx` renders the landing with scripting off and would fail if
 * the bar needed a reader to see the page.
 *
 * **The family moved out of the navigation row and into a menu, and it is a menu rather
 * than a filtered list.** The old switcher sat in the header's `actions` slot and carried
 * only this site's siblings, because the brand lockup had already drawn this site's mark
 * and drawing it twice read as a mistake. One control fixes that without hiding a member
 * of the set: nothing is adjacent to the lockup while the menu is closed, and the member
 * the reader is on is marked when it is open.
 *
 * **The bar is sticky, and this is the site that needed it most.** The landing is nine
 * bands long and the hidden state below the header is the one thing on this site that a
 * reader can arrive after, not see. The `actions` slot is left empty: this site has no
 * control of its own that belongs above the fold, and an empty slot is the honest way to
 * say so.
 */
export type SiteSection = '/docs' | '/blog' | '/about';

export function SiteChrome({
  current,
  children,
}: {
  /** The destination this page is serving, so the bar can mark the reader's place. */
  current?: SiteSection;
  children: ReactNode;
}): ReactNode {
  return (
    <>
      <SiteNavbar
        product={BAR_PRODUCT}
        defaultPack={BAR_DEFAULT_PACK}
        defaultMode={BAR_DEFAULT_MODE}
        nav={NAV.map((link) => ({ ...link, current: current === link.href }))}
        navLabel={COPY.nav}
        sites={SITES}
        currentSiteId={CURRENT_SITE_ID}
        sitesLabel={COPY.sites}
        search={{
          indexUrl: '/api/search',
          label: COPY.search,
          hint: COPY.searchHint,
          messages: {
            close: COPY.searchClose,
            loading: COPY.searchLoading,
            failed: COPY.searchFailed,
            empty: COPY.searchEmpty,
            one: COPY.searchOne,
            other: COPY.searchOther,
          },
        }}
        mode={{ lightLabel: COPY.toDark, darkLabel: COPY.toLight }}
        mobileLabels={{ open: COPY.menuOpen, close: COPY.menuClose }}
      />
      <main className="site-main">{children}</main>
      <SiteFooter
        product={BAR_PRODUCT}
        columns={FOOTER_COLUMNS.map((column) => ({
          title: column.title,
          links: [...column.links],
        }))}
      />
    </>
  );
}

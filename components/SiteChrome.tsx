import type { ReactNode } from 'react';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar';

import {
  BAR_DEFAULT_MODE,
  BAR_DEFAULT_PACK,
  BAR_PRODUCT,
  COPY,
  CURRENT_SITE_ID,
  NAV,
  SITES,
} from '@/lib/bar';
import { AlphaLensLogo } from '@/components/logo';

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
 * island in `@nanisoft/prism-ui` rather than lines in this repository. This repository
 * draws no client boundary of its own at all, so the bar was never a second one:
 * `test/no-hidden-state.test.ts` asserts the count of client directives is zero.
 *
 * **The family moved out of the navigation row and into a menu, and it is a menu rather
 * than a filtered list.** The old switcher sat in the header's `actions` slot and carried
 * only this site's siblings, because the brand lockup had already drawn this site's mark
 * and drawing it twice read as a mistake. One control fixes that without hiding a member
 * of the set: nothing is adjacent to the lockup while the menu is closed, and the member
 * the reader is on is marked when it is open.
 *
 * **The bar is sticky, and this is the site that needed it most.** The landing is nine
 * bands long, so the bar scrolling away takes the only persistent way back to the docs
 * with it. The `actions` slot is left empty: this site has no control of its own that
 * belongs above the fold, and an empty slot is the honest way to say so.
 */
export type SiteSection = '/docs' | '/blog' | '/about';

/*
 * The product, as the chrome draws it: the same three facts the bar and the
 * footer have always read, plus the drawing. The mark is this site's own logo,
 * and it is the sign in the row, in the mobile panel and at the foot of the
 * page from this one fact, so a reader meets one sign three times rather than
 * a disc twice and a drawing once.
 */
const PRODUCT = { ...BAR_PRODUCT, mark: <AlphaLensLogo className="site-product-mark" /> };

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
        product={PRODUCT}
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
        product={PRODUCT}
        about={
          // The one sentence a reader who reached the bottom has not been told
          // yet, in this site's own words from its own share card.
          <p className="site-footer-about">
            AlphaLens is quantitative trading research for the Indian market:
            intelligence, simulation and one data contract.
          </p>
        }
        columns={[
          {
            title: 'This site',
            links: [
              { label: 'Landing', href: '/' },
              ...NAV.map((link) => ({ label: link.label, href: link.href })),
            ],
          },
          {
            // The family, read from the same directory the bar's menu reads,
            // minus the member the reader is already on. Every site in the
            // family holds this same column to this same rule, so the foot of
            // one site answers the same question the foot of every other one
            // does: where else does this company go.
            title: 'The family',
            links: SITES.filter((site) => site.id !== BAR_PRODUCT.id).map((site) => ({
              label: site.name,
              href: site.href,
              newTab: true,
            })),
          },
        ]}
        legal={'\u00a9 NaniSoft'}
      />
    </>
  );
}

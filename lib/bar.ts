/**
 * The bar's own facts, as data.
 *
 * Everything the bar needs that is not the content tree: this site's own three
 * destinations, the family's five sites, and every sentence the bar's controls can
 * say. They are one module because they are one decision, and a bar whose control
 * names live in three files is a bar where a reader finds "Search" in one place and
 * "No matches." in another.
 *
 * **No pack chooser, and the omission is the decision.** `SiteNavbar` takes a colour
 * menu and this site does not pass one. A page's ground is stable for the life of the
 * page, and a control that let a reader repaint it would be offering them a page that
 * is not this one. Prism's own site is the site whose subject is its palettes, and it
 * is the one that gets the chooser.
 *
 * The mode toggle is here even though the ground is fixed, because the mode is the one
 * theme axis that is a reader's rather than the page's, and because the whole family
 * stores it under one key: a reader who chose dark on one NaniSoft site arrives in
 * dark on the other four. On this site that control is the only reader-facing theme
 * choice there has ever been, because the ground was never a choice to begin with.
 */
import type { SiteNavLink } from '@nanisoft/prism-ui/blocks/site-navbar';
import type { SwitcherProduct } from '@nanisoft/prism-ui/components/product-switcher';

import { DEFAULT_MODE, GROUND_PACK, PRODUCTS, SITE_PRODUCT } from './site';

/** The product this bar belongs to, which is the same mark the footer draws. */
export const BAR_PRODUCT = SITE_PRODUCT;

/** The pack a reader who has never chosen gets. This site's own ground. */
export const BAR_DEFAULT_PACK = GROUND_PACK;

/** The mode a reader who has never chosen gets, from the constant the document uses. */
export const BAR_DEFAULT_MODE = DEFAULT_MODE;

/**
 * This site's own three destinations.
 *
 * The labels and the destinations are the ones this chrome has always published,
 * unchanged. The order is the order a reader is most likely to want them: the
 * documentation is what a reader came for, the blog is what they read next, and About
 * is the one they read once.
 */
export const NAV: readonly SiteNavLink[] = [
  { label: 'Docs', href: '/docs' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

/**
 * The family's five sites, and the reader is on one of them.
 *
 * This used to be a sibling-only list with this site's own mark filtered out of it,
 * because the bar drew the brand lockup and then, immediately after it, a switcher whose
 * first member was the same product in the same colour at a smaller size. The bar opened
 * with the word AlphaLens twice. That was a real duplicate and the fix for it was to hide
 * a member of the family rather than to stop drawing it twice.
 *
 * The menu is the better fix and it is the design system's: the set is closed until a
 * reader opens it, so nothing is adjacent to the lockup at first paint, and the member
 * the reader is on is marked `aria-current="page"` when the menu is open. Every member
 * is published, including this one, which is what "the set of five" has to mean for the
 * control to be a control rather than a subset.
 */
export const SITES: readonly SwitcherProduct[] = PRODUCTS;

/** The reader's own site, named so the menu can mark it. */
export const CURRENT_SITE_ID = SITE_PRODUCT.id;

/** The two columns the footer has always published, in the Block's own shape. */
export const FOOTER_COLUMNS: readonly { title: string; links: readonly SiteNavLink[] }[] = [
  {
    title: 'Site',
    links: [
      { label: 'Landing', href: '/' },
      { label: 'Docs', href: '/docs' },
      { label: 'Blog', href: '/blog' },
      { label: 'About', href: '/about' },
    ],
  },
  {
    title: 'Docs',
    links: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Data platform', href: '/docs/data-platform' },
      { label: 'Unified data contract', href: '/docs/data-contract' },
      { label: 'Research pipeline', href: '/docs/research-pipeline' },
    ],
  },
];

/**
 * Every sentence the bar and the search dialog can say.
 *
 * A Block ships no copy, which is the right rule and it is why this object exists
 * rather than a default inside the package: the words a reader hears on this site are
 * this site's words. The two result labels are a pair because English inflects the noun
 * with the number, and the pair is where a site whose language does not put the number
 * first would supply its own order.
 */
export const COPY = {
  nav: 'Sections',
  sites: 'Products',
  search: 'Search AlphaLens',
  searchHint: 'Type to search the documentation and every post.',
  searchClose: 'Close search',
  searchLoading: 'Loading the search index.',
  searchFailed: 'The search index could not be loaded.',
  searchEmpty: 'No matches.',
  searchOne: 'result.',
  searchOther: 'results.',
  toDark: 'Switch to dark mode',
  toLight: 'Switch to light mode',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
} as const;

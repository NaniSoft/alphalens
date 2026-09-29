import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteHeader } from '@nanisoft/prism-ui/blocks/site-header';
import { ProductSwitcher } from '@nanisoft/prism-ui/components/product-switcher';
import { PrismThemeScript } from '@nanisoft/prism-ui/provider';

import { DEFAULT_MODE, GROUND_PACK, SIBLING_PRODUCTS, SITE_PRODUCT, THEME_ATTRIBUTES } from '@/lib/site';
import { revealArmScript } from '@/lib/reveal-arm';

// The one stylesheet. Every token, every utility and every base rule on this site
// arrives in this one import: the design system compiles its own source into it, and
// a consumer adds its own sheet after it and nothing else.
import '@nanisoft/prism-ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AlphaLens: quantitative trading research for the Indian market',
    template: '%s · AlphaLens',
  },
  description:
    'AlphaLens captures the full NSE option chain every market minute and conforms it into one research-ready feed. A live data layer, an approved contract and a designed research pipeline, labelled honestly.',
};

/** The lean site nav the shared chrome renders between brand and actions. */
const NAV = [
  { label: 'Docs', href: '/docs' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
] as const;

/**
 * The document: the two theme attributes, two blocking scripts, the chrome, the page.
 *
 * **No provider, no client runtime, no baked stylesheet.** The old layout mounted a
 * theme provider, imported a registry for a component library that no longer exists,
 * and loaded 126 KB of generated variables to define the sixty custom properties the
 * site's own CSS read. The theme is now two attributes on the document element and a
 * blocking script that applies a stored choice to them before first paint, which is the
 * arrangement the design system documents as the default and the one the whole page is
 * built for: a server render, no client JavaScript of its own, and a page that is
 * correct with scripting disabled.
 *
 * The second script is the arming half of the reveal law, and it is here for the same
 * reason the first is: both are the smallest strings that can do a job that has to
 * happen before the page is parsed. See `lib/reveal-arm.ts` for what the attribute it
 * writes is and who removes it.
 *
 * **The switcher sits in the header's `actions` slot, at the far end of the bar.** It
 * used to be the `products` prop, which puts it between the brand lockup and this
 * site's own navigation, so the three links a reader came to this site for were the
 * last three things in the bar and after four products that were not this one. The bar
 * is now: which site you are on, where you can go on it, and then the rest of the
 * platform. The `actions` slot is the design system's own place for what a site owns on
 * the right, and a switcher is a control a product owns, so the move is the documented
 * arrangement rather than an override. Three of the four pastel packs are on every page
 * rather than on one page of one site, and both regions that carry a boundary still do:
 * this slot and the platform product rows, and in both the boundary lands on a
 * `ProductMark`, which is a fully rounded disc, so it moves nothing about the mark's
 * shape. `navLabel` is required by the Block and is this site's own name for the header's
 * destinations, which is not the switcher's name, so the switcher is given its own.
 */

// The design system's own first family, and the only file this site loads.
//
// `--font-sans` in prism's emitted sheet reads `Inter, ui-sans-serif, system-ui, ...`
// and 0.7.0 carries no font file, so a site that loads nothing renders in the
// platform's UI face, which is the one face a design system never means by its first
// choice. The fallback list prism declares is kept verbatim behind this one, so
// nothing about the design system's intent changes; the only difference is that its
// first entry now exists. The migration dropped this site's Archivo and JetBrains Mono
// and let the display type fall back to the platform face, which is the most visible
// change the migration made and the wrong one to leave in place.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} {...THEME_ATTRIBUTES} suppressHydrationWarning>
      <head>
        {/* Before paint, on the same attributes the server rendered: a stored choice
            is applied and a stored value that no longer parses is left in place, so
            nothing a reader chose is ever cleared by this site. */}
        <PrismThemeScript defaultPack={GROUND_PACK} defaultMode={DEFAULT_MODE} />
        {/* The arming half of the reveal law, and the only writer of the attribute the
            landing's hidden state is scoped under. */}
        <script dangerouslySetInnerHTML={{ __html: revealArmScript }} />
      </head>
      <body>
        <SiteHeader
          product={SITE_PRODUCT}
          nav={NAV}
          navLabel="Sections"
          actions={<ProductSwitcher products={SIBLING_PRODUCTS} label="Products" />}
        />
        <main className="site-main">{children}</main>
        <SiteFooter
          product={SITE_PRODUCT}
          columns={[
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
          ]}
        />
      </body>
    </html>
  );
}

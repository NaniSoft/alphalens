import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { PrismThemeScript } from '@nanisoft/prism-ui/provider';

import { DEFAULT_MODE, GROUND_PACK, THEME_ATTRIBUTES } from '@/lib/site';

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

/**
 * The document, and nothing else: the two theme attributes, one blocking script, the
 * page.
 *
 * **This site loads no font file at all.** It used to: `next/font/google` was
 * downloading Inter at build time and `app/globals.css` was repointing `--font-sans`
 * at the result, on the stated ground that prism shipped no typeface. The migration
 * dropped this site's Archivo and JetBrains Mono and let the display type fall back to
 * the platform face, which was the most visible change the migration made and the
 * wrong one to leave in place.
 *
 * Prism then shipped Inter as three static woff2 files under the OFL, with three
 * `@font-face` rules in its own emitted sheet, which turned that workaround into the
 * defect it had always been: the same family declared twice, a build that depended on
 * a download from Google, and a second copy of every glyph on the wire. So the download
 * is gone, `app/globals.css` no longer overrides `--font-sans`, and
 * `prism-gates.json` no longer records a build-supplied custom property. What the
 * design system publishes is what the page uses, which is the arrangement the rest of
 * this file already takes with the theme.
 *
 * **The chrome left this file.** It is in `components/SiteChrome.tsx` now, and each page
 * renders it against the page it is serving, because a layout is rendered once per route
 * and is handed no pathname, so a bar that lives here can never mark the page a reader
 * is on. A server render is handed the route it is rendering, so the current link is a
 * prop rather than something the browser has to be asked for, and no client boundary
 * came with the move.
 *
 * **No provider, no client runtime of its own, no baked stylesheet.** The old layout
 * mounted a theme provider, imported a registry for a component library that no longer
 * exists, and loaded 126 KB of generated variables to define the sixty custom properties
 * the site's own CSS read. The theme is now two attributes on the document element and a
 * blocking script that applies a stored choice to them before first paint, which is the
 * arrangement the design system documents as the default and the one the whole page is
 * built for: a server render, no client JavaScript of its own, and a page that is
 * correct with scripting disabled.
 *
 * **One script, and it is the theme.** There used to be a second: an inlined arming
 * script that wrote the attribute a CSS-authored scroll reveal was scoped under, for a
 * reveal no element on this site carried. Zero of the thirty-six emitted pages hold a
 * `data-reveal` attribute, so the hidden state did not exist to be escaped, and the
 * whole arrangement - the only `'use client'` line in the tree, the arming module, four
 * stylesheet rules including a scoped `opacity: 0`, and a test that rendered the landing
 * with scripting off - was observing an empty `NodeList`. What the reasoning in it was
 * worth did not die with it: a hidden state must be escapable rather than
 * escapable-after-a-delay, and a `load` listener beats a `setTimeout` because a timer's
 * clock starts at first style resolution rather than at the moment it would have been
 * cancelled. If Prism ever ships a Block-level entrance, that argument is where it
 * belongs, and `DESIGN.md` under Motion already carries it. This repository now says
 * nothing about hidden states at all, which is a true statement rather than a quiet one.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...THEME_ATTRIBUTES} suppressHydrationWarning>
      <head>
        {/* Before paint, on the same attributes the server rendered: a stored choice
            is applied and a stored value that no longer parses is left in place, so
            nothing a reader chose is ever cleared by this site. */}
        <PrismThemeScript defaultPack={GROUND_PACK} defaultMode={DEFAULT_MODE} />
      </head>
      <body>{children}</body>
    </html>
  );
}

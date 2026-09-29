/**
 * The site's own facts, read from `site.json` and typed by the design system's vocabulary.
 *
 * Three decisions live here and nowhere else, which is why they are one module: the
 * page's ground pack, the mode a reader who has never chosen gets, and the set of
 * products the switcher moves between. The retired line kept the same three facts in
 * about twenty lines of theme module together with a type import and an inlined boot
 * script, and patching that module one import at a time passed a read-through and
 * failed a build. So all three are rewritten at once, and the two things that came
 * with them - a pack class on the document element and a baked variablesheet that
 * defined every custom property the site's own CSS read - are gone rather than
 * reimplemented.
 *
 * **The ground is `blush` and it does not change.** A page's ground is stable for the
 * life of the page; it is a property of the page, not of the reader. It is applied
 * declaratively on the document element and never read back, so a stored theme can
 * repaint this site's mode and the marks on the page and cannot repaint the ground out
 * from under a section that is not a boundary.
 *
 * The pack vocabulary is the design system's, so `pack` below is a compile error
 * rather than a string that matches no emitted rule. That is the whole reason this
 * file is a `.json` read by a typed module rather than a list of literals in a `.ts`:
 * a hand-written list of pack names is a second vocabulary, and the retired line's
 * `rose` is exactly what one looks like after the vocabulary moves.
 */
import { PACKS, themeAttributes, type Mode, type PackId } from '@nanisoft/prism-ui/theming';
import type { SwitcherProduct } from '@nanisoft/prism-ui/components/product-switcher';

import site from './site.json';

/** Every pack the token build emits, so a mistyped id fails here rather than silently. */
const PACK_IDS: readonly string[] = PACKS;

function pack(value: string): PackId {
  if (!PACK_IDS.includes(value)) {
    throw new Error(
      `site.json: "${value}" is not one of the published packs (${PACK_IDS.join(', ')}), so a mark ` +
        'carrying it would match no emitted rule and would paint the ground instead.',
    );
  }
  return value as PackId;
}

/** The pack the whole page sits on. See the note above: a ground does not change. */
export const GROUND_PACK: PackId = pack(site.ground);

/** What a reader who has never chosen a theme sees. Dark, the platform precedent. */
export const DEFAULT_MODE = site.defaultMode as Mode;

/**
 * The two attributes that carry the theme, for the document element.
 *
 * Spread onto `<html>` and the whole page is themed with no client runtime at all: no
 * provider, no context, no hook, no class swap. The boot script reads the document's own
 * attributes before it reads storage, so what the server rendered and what the reader
 * stored cannot disagree about the mode, and a page is correct with scripting off.
 */
export const THEME_ATTRIBUTES = themeAttributes({ pack: GROUND_PACK, mode: DEFAULT_MODE });

/** The product this site is, as the mark the chrome draws it with. */
export const SITE_PRODUCT = {
  id: site.siteId,
  name: 'AlphaLens',
  pack: GROUND_PACK,
} as const;

/**
 * The set of products the switcher moves between, in the order a reader meets them.
 *
 * This site is one of four products on one platform, so its switcher carries all of
 * them. Its own mark wears the page's own pack rather than the spectrum, because this
 * site does have a pack: a brand lockup drawn in the colour the page is painted in is
 * the honest mark for the page that is the product.
 *
 * The directory is a JSON file rather than a list in this module, because two
 * independent readers need it and a TypeScript module is not one of them: the test
 * imports it, and a script reads the file the same way it reads the route inventory.
 */
export const PRODUCTS: readonly SwitcherProduct[] = site.products.map((product) => ({
  id: product.id,
  name: product.name,
  pack: pack(product.pack),
  href: product.href,
}));

/**
 * The other products, which is what the header's switcher draws.
 *
 * **The product the reader is already on is not in this set, and that is the fix.** The
 * header drew the brand lockup and then, immediately after it, a switcher whose first
 * member was the same product in the same colour at a smaller size, so the bar opened
 * with the word AlphaLens twice and a reader had to work out which of the two was the
 * link they were on. The brand lockup already answers that: it is this page's mark, and
 * it is the destination `/`, which is where the reader already is. So the switcher
 * carries the three products beside it and means what its own label says: the platform.
 *
 * Every destination the old switcher published is still published. `/` is the brand
 * lockup and the footer's first link, and the other four are the three marks here plus
 * `www`, so nothing a reader could reach has gone anywhere.
 */
export const SIBLING_PRODUCTS: readonly SwitcherProduct[] = PRODUCTS.filter(
  (product) => product.id !== SITE_PRODUCT.id,
);

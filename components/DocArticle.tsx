// The doc-page template: DocsShell wearing the page's sidebar tree, its TOC rail,
// and the pager it derives from them. Structural props only, and fumadocs types stay
// at the app layer, mapped through `lib/to-prism-tree` before they reach prism-ui.

import type { ComponentType, ReactElement, ReactNode } from 'react';
import { DocsShell, type DocsNavEntry } from '@nanisoft/prism-ui/pages';
import type { Root } from 'fumadocs-core/page-tree';

import { getMdxComponents } from '@/lib/mdx-components';
import { toPrismTree } from '@/lib/to-prism-tree';

export interface DocArticlePage {
  url: string;
  data: {
    title?: string;
    description?: string;
    /** fumadocs TOC entries: `{ title, url, depth }`. */
    toc?: { title: ReactNode; url: string; depth: number }[];
    /** The compiled MDX body component. */
    body: ComponentType<{ components?: Record<string, ComponentType<Record<string, unknown>>> }>;
  };
}

export interface DocArticleProps {
  page: DocArticlePage;
  /** The section's page tree (sidebar). */
  tree: Root;
}

export interface DocArticleLabels {
  /** The rail's accessible name, and a word a reader hears. */
  nav: string;
  /** The contents rail's accessible name. */
  toc: string;
  /** The pager's accessible name. */
  pager: string;
}

/** The two words the pager renders above the neighbouring pages' titles. */
export const PAGER_LABELS = { previous: 'Previous', next: 'Next' } as const;

/**
 * The page's own outline, as the rail's three shapes.
 *
 * Two levels and no more: a document's `h2` and `h3` are the headings a reader scrolls
 * past looking for the paragraph they half-remember, and `h4` and below are inside a
 * step of a sequence. A contents list is a promise that every entry in it is a place in
 * the document, so it is the whole outline or none of it: a partial one lies about the
 * page it is attached to.
 *
 * The entries are `page` rather than `group`, because a heading in a document is a
 * destination and not a section, and a destination gets an anchor. The `depth` is dropped
 * on purpose - Prism's rail indents one level per nested group, and nesting by depth
 * would be a second indent axis saying something the outline already said.
 */
function toTocEntries(toc: NonNullable<DocArticlePage['data']['toc']>): DocsNavEntry[] {
  return toc
    .filter((entry) => entry.depth >= 2 && entry.depth <= 3)
    .map((entry) => ({
      type: 'page',
      title: typeof entry.title === 'string' ? entry.title : '',
      href: entry.url,
    }));
}

/**
 * One documentation page: the rail, the document at the measure, the contents rail, and
 * the pager.
 *
 * **The pager is derived, not passed.** The retired template computed the two
 * neighbouring pages with fumadocs' `findNeighbour` and handed them to the shell, which
 * was a second derivation of something the rail already knew: the tree holds every page
 * in the order a reader meets them, so `currentHref` plus the tree is the whole
 * derivation. Passing neighbours also permitted a neighbour that is not in the tree,
 * which is the one arrangement a reader would notice.
 *
 * The body is `children` rather than a parsed document, because a Markdown pipeline owns
 * the words and Prism owns the measure and the rhythm around them. `Prose` is inside the
 * Page, so this site no longer carries a rule for what an `h2` or a `blockquote` looks
 * like.
 */
export function DocArticle({ page, tree, labels }: DocArticleProps & { labels: DocArticleLabels }): ReactElement {
  const MDX = page.data.body;

  return (
    <DocsShell
      title={page.data.title}
      description={page.data.description}
      nav={toPrismTree(tree.children)}
      toc={page.data.toc ? toTocEntries(page.data.toc) : undefined}
      currentHref={page.url}
      navLabel={labels.nav}
      tocLabel={labels.toc}
      pagerLabel={labels.pager}
      pagerLabels={PAGER_LABELS}
    >
      <MDX components={getMdxComponents()} />
    </DocsShell>
  );
}

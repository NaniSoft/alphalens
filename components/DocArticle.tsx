// The doc-page template: DocsShell wearing the page's sidebar tree, its TOC rail,
// and the pager it derives from them. Structural props only, and fumadocs types stay
// at the app layer, mapped through `lib/to-prism-tree` before they reach prism-ui.

import { isValidElement, type ComponentType, type ReactElement, type ReactNode } from 'react';
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
 * A title is resolved to its words rather than read as one, because a `ReactNode` is not
 * a label and fumadocs does not fill that field with a bare string: its heading plugin
 * wraps a heading's own children in a fragment, so `## Columns` arrives as an element
 * holding that string and a heading carrying inline code arrives as an element holding an
 * element. Words are the only thing a label can be made of, so the nodes are walked for
 * them and nothing else is taken from them. An entry that yields no words is dropped
 * rather than forwarded, because a row of nothing in the rail is not a place in the
 * document, and offering one is the same lie the two-level filter above refuses to tell.
 *
 * The entries are `page` rather than `group`, because a heading in a document is a
 * destination and not a section, and a destination gets an anchor. The `depth` is dropped
 * on purpose - Prism's rail indents one level per nested group, and nesting by depth
 * would be a second indent axis saying something the outline already said.
 */
function toTocEntries(toc: NonNullable<DocArticlePage['data']['toc']>): DocsNavEntry[] {
  const entries: DocsNavEntry[] = [];
  for (const entry of toc) {
    if (entry.depth < 2 || entry.depth > 3) continue;
    /* Trimmed out here and not in the walk, because the walk concatenates the nodes a
       heading is split across and the spaces between those nodes are part of the title. */
    const title = tocWords(entry.title).trim();
    if (!title) continue;
    entries.push({ type: 'page', title, href: entry.url });
  }
  return entries;
}

/**
 * A heading's title as the text it will be read as.
 *
 * Everything in a `ReactNode` except the two text primitives is either a container or
 * React's own way of writing nothing: an element, an array of the two, or `null`,
 * `undefined` and the booleans. A number among them is text and a boolean is not, which is
 * the whole distinction this walk draws. A node that is none of those resolves to no
 * words, and an entry holding one is not a destination the reader can follow.
 */
function tocWords(title: ReactNode): string {
  if (typeof title === 'string') return title;
  if (typeof title === 'number' || typeof title === 'bigint') return String(title);
  if (Array.isArray(title)) return title.map(tocWords).join('');
  if (isValidElement<{ children?: ReactNode }>(title)) return tocWords(title.props.children);
  return '';
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

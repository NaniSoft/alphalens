// The doc-page template: DocsShell wearing the page's sidebar tree, TOC rail,
// and prev/next. Structural props only — fumadocs types stay at the app layer,
// mapped through lib/to-prism-tree before they reach prism-ui.

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
  /** Prev/next at the section boundary. */
  neighbours?: { previous?: { title: string; url: string }; next?: { title: string; url: string } };
  /** Scope key for this page's MDX (kept for parity with prism's site). */
  itemKey: string;
}

function toTocEntries(toc: NonNullable<DocArticlePage['data']['toc']>): DocsNavEntry[] {
  return toc
    .filter((entry) => entry.depth >= 2 && entry.depth <= 3)
    .map((entry, index) => ({
      id: `${entry.url}-${index}`,
      title: typeof entry.title === 'string' ? entry.title : '',
      url: entry.url,
    }));
}

export function DocArticle({ page, tree, neighbours }: DocArticleProps): ReactElement {
  const MDX = page.data.body;

  return (
    <DocsShell
      title={page.data.title}
      description={page.data.description}
      nav={toPrismTree(tree.children)}
      toc={page.data.toc ? toTocEntries(page.data.toc) : undefined}
      neighbours={neighbours}
    >
      <div className="site-prose">
        <MDX components={getMdxComponents()} />
      </div>
    </DocsShell>
  );
}

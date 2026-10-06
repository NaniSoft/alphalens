import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';

import { DocArticle } from '@/components/DocArticle';
import { DocsIndex } from '@/components/DocsIndex';
import { SiteChrome } from '@/components/SiteChrome';
import { docsSource } from '@/lib/source';

// Optional catch-all: `/docs` renders the section index, `/docs/<slug>` the
// page. The optional root keeps the static export satisfiable (Next requires
// every dynamic route to emit at least one page under `output: export`).

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export function generateStaticParams(): Array<{ slug?: string[] }> {
  // The root entry (`/docs`) is required under `output: export` for an
  // optional catch-all.
  return [{ slug: undefined }, ...docsSource.generateParams()];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return {
      title: 'Docs',
      description:
        'The AlphaLens data platform, the unified data contract, the research pipeline design, and the engineering story.',
    };
  }
  const page = docsSource.getPage(slug);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

/**
 * The three landmarks' names, as data.
 *
 * Every one of them is required by the Page because each is a word a reader hears: a
 * Page that ships no copy ships no reader-facing copy either, and the alternative is
 * three landmark names the design system chose for four products that file their
 * documentation differently. The pager's two words live beside them in `DocArticle`, and
 * they changed from the arrow glyphs the retired markup drew: a glyph is punctuation a
 * screen reader reads as punctuation, and a word is a label.
 */
const LABELS = {
  nav: 'Documentation',
  toc: 'On this page',
  pager: 'Adjacent pages',
} as const;

export default async function DocsPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  if (!slug) {
    return (
      <SiteChrome current="/docs">
        <DocsIndex tree={docsSource.getPageTree()} labels={LABELS} />
      </SiteChrome>
    );
  }

  const page = docsSource.getPage(slug);
  if (!page) notFound();

  // `/docs` marks the navigation and every document under it does too, because the
  // bar's three destinations are this site's own top level rather than every route
  // beneath it. A reader twenty pages into the contract is still in the docs, and a bar
  // that had stopped saying so would be a bar that had lost the answer to the question
  // it exists to answer.
  return (
    <SiteChrome current="/docs">
      <DocArticle page={page} tree={docsSource.getPageTree()} labels={LABELS} />
    </SiteChrome>
  );
}

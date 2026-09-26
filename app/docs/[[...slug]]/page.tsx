import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { findNeighbour } from 'fumadocs-core/page-tree';

import { DocArticle } from '@/components/DocArticle';
import { DocsIndex } from '@/components/DocsIndex';
import { docsSource } from '@/lib/source';

// Optional catch-all: `/docs` renders the section index, `/docs/<slug>` the
// page. The optional root keeps the static export satisfiable (Next requires
// every dynamic route to emit at least one page under `output: export`) —
// prism.nanisoft.com's trick, proven there.

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

export default async function DocsPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  if (!slug) {
    const pages = docsSource
      .getPages()
      .map((page) => ({
        title: page.data.title ?? page.url,
        description: page.data.description ?? '',
        url: page.url,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
    return <DocsIndex pages={pages} />;
  }

  const page = docsSource.getPage(slug);
  if (!page) notFound();

  const tree = docsSource.getPageTree();
  const neighbour = findNeighbour(tree, page.url);

  return (
    <DocArticle
      page={page}
      tree={tree}
      itemKey={page.url.replace(/^\//, '')}
      neighbours={{
        previous: neighbour.previous && { title: String(neighbour.previous.name), url: neighbour.previous.url },
        next: neighbour.next && { title: String(neighbour.next.name), url: neighbour.next.url },
      }}
    />
  );
}

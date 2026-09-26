// The `/docs` section index: every corpus page as one hairline card, grouped
// by the section it lives in. DocsShell (the pages layer) carries the frame;
// the grid is site CSS.

import type { ReactElement } from 'react';
import { DocsShell } from '@nanisoft/prism-ui/pages';
import Link from 'next/link';

export interface DocsIndexPage {
  title: string;
  description: string;
  url: string;
}

export function DocsIndex({ pages }: { pages: DocsIndexPage[] }): ReactElement {
  return (
    <DocsShell
      title="Docs"
      description="AlphaLens in full — the live data platform, the approved data contract, the designed research pipeline, and the engineering story. Every page carries its own status label."
    >
      <div className="site-docs-index">
        <p className="site-status-note">
          <strong>Status</strong>
          <span>
            In active development. Claims are labelled <strong>live</strong>,{' '}
            <strong>approved / designed</strong>, or <strong>research direction</strong> — the labels
            are the contract between this site and the reader.
          </span>
        </p>
        <ul className="site-docs-index__grid">
          {pages.map((page) => (
            <li key={page.url}>
              <Link href={page.url} className="site-docs-index__card">
                <span className="site-docs-index__title">{page.title}</span>
                <span className="site-docs-index__description">{page.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </DocsShell>
  );
}

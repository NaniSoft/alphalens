// The `/docs` section index: every corpus page as a hairline card, grouped by the
// section it lives in. The frame is the design system's DocsShell and the grid is this
// site's own CSS, because the catalogue deliberately ships no documentation index: a
// Page is judged on what it encodes, and the four documentation sets in this family are
// four different shapes.

import type { ReactElement } from 'react';
import { DocsShell } from '@nanisoft/prism-ui/pages';
import Link from 'next/link';

export interface DocsIndexPage {
  title: string;
  description: string;
  url: string;
}

export interface DocsIndexLabels {
  nav: string;
  toc: string;
  pager: string;
}

/**
 * The index, over the whole corpus.
 *
 * **The section is a label and the pages under it are destinations.** The index has no
 * rail, so the sections are headings over their pages and nothing else: a link whose
 * destination is a page in the list below it is a link that goes nowhere a reader has
 * not already been, and six of them read as six invitations to jump into a pipeline out
 * of order. So the sections are `group` entries with no `href`, which Prism renders as a
 * span, and every card in the grid is a real `href` to a real route.
 *
 * **The status note opens the list, not the sections.** The three tiers are stated once,
 * in the note under the title, because a reader who is told what the labels mean once
 * does not need each section to repeat it, and a tier repeated on every heading is a
 * badge in all but name.
 */
export function DocsIndex({ pages, labels }: { pages: DocsIndexPage[]; labels: DocsIndexLabels }): ReactElement {
  const sections = groupBySection(pages);

  return (
    <DocsShell
      title="Docs"
      description="AlphaLens in full: the live data platform, the approved data contract, the designed research pipeline, and the engineering story. Every page carries its own status label."
      nav={sections.map((section) => ({
        type: 'group',
        title: section.title,
        items: section.pages.map((page) => ({ type: 'page', title: page.title, href: page.url })),
      }))}
      navLabel={labels.nav}
      tocLabel={labels.toc}
      pagerLabel={labels.pager}
      pagerLabels={{ previous: 'Previous', next: 'Next' }}
    >
      <p className="site-status-note">
        <span className="site-status-note__label">Status</span>
        <span className="site-status-note__body">
          In active development. Claims are labelled <strong>live</strong>,{' '}
          <strong>approved / designed</strong>, or <strong>research direction</strong>. The labels
          are the contract between this site and the reader.
        </span>
      </p>

      {sections.map((section) => (
        <section className="site-docs-section" key={section.title}>
          <h2 className="site-docs-section__title">{section.title}</h2>
          <ul className="site-docs-index__grid">
            {section.pages.map((page) => (
              <li key={page.url}>
                <Link href={page.url} className="site-docs-index__card">
                  <span className="site-docs-index__title">{page.title}</span>
                  <span className="site-docs-index__description">{page.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </DocsShell>
  );
}

/**
 * The corpus, grouped by the section each page lives in.
 *
 * The order is the sections' own order, taken from the tree the content pipeline
 * publishes, and the order within a section is the order the section's own `meta.json`
 * files. Nothing here is sorted: an index that alphabetised its own contents would be
 * asserting that the corpus is a set rather than a sequence, and four of these six
 * sections are a sequence.
 *
 * It is derived from the page tree rather than from the URL, because the URL is a route
 * and the tree is the structure. A page filed under a section by its path is a page whose
 * section changes when a folder is renamed.
 */
function groupBySection(pages: DocsIndexPage[]): Array<{ title: string; pages: DocsIndexPage[] }> {
  const sections: Array<{ title: string; pages: DocsIndexPage[] }> = [];
  for (const page of pages) {
    const segment = page.url.split('/')[2] ?? '';
    const existing = sections.find((section) => section.title === segment);
    if (existing) existing.pages.push(page);
    else sections.push({ title: segment, pages: [page] });
  }
  return sections;
}

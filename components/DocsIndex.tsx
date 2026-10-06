// The `/docs` section index: every corpus page as a hairline card, grouped by the
// section it lives in. The frame is the design system's DocsShell and the grid is this
// site's own CSS, because the catalogue deliberately ships no documentation index: a
// Page is judged on what it encodes, and the four documentation sets in this family are
// four different shapes.
//
// Both halves are read from the page tree the content pipeline publishes, through
// `lib/to-prism-tree.ts`, so the section names, the section order and the documents
// inside each section are the tree's and cannot disagree with the rail beside them.

import type { ReactElement } from 'react';
import type { Root } from 'fumadocs-core/page-tree';
import { DocsShell } from '@nanisoft/prism-ui/pages';
import Link from 'next/link';

import { toIndexSections, toPrismTree } from '@/lib/to-prism-tree';

export interface DocsIndexLabels {
  nav: string;
  toc: string;
  pager: string;
}

/**
 * The index, over the whole corpus.
 *
 * **The section is a label and the pages under it are destinations.** The index body has
 * no navigation of its own to hang one, so a section is a heading over its pages and
 * nothing else: a link whose destination is a page in the list below it is a link that goes
 * nowhere a reader has not already been, and six of them read as six invitations to jump
 * into a pipeline out of order. So the sections are `group` entries with no `href`, which
 * Prism renders as a span, and every card in the grid is a real `href` to a real route.
 *
 * **The rail beside this body is the tree, rendered by the same function that renders it
 * on every documentation page.** It used to be derived from this component's own grouping,
 * which is how the index came to print a section as an empty `<h2>` and an empty label in
 * its rail while a documentation page printed the same six sections with their real names.
 * The rail on `/docs` and the rail on `/docs/reference` are now the same call over the
 * same input, so a reader who learns a section's name here meets the same name there.
 *
 * **The status note opens the list, not the sections.** The three tiers are stated once,
 * in the note under the title, because a reader who is told what the labels mean once
 * does not need each section to repeat it, and a tier repeated on every heading is a
 * badge in all but name.
 */
export function DocsIndex({ tree, labels }: { tree: Root; labels: DocsIndexLabels }): ReactElement {
  const sections = toIndexSections(tree);

  return (
    <DocsShell
      title="Docs"
      description="AlphaLens in full: the live data platform, the approved data contract, the designed research pipeline, and the engineering story. Every page carries its own status label."
      nav={toPrismTree(tree.children)}
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

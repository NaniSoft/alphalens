import { readFileSync } from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Root } from 'fumadocs-core/page-tree';

import { DocsIndex } from '@/components/DocsIndex';

/**
 * The `/docs` section index, read off the corpus it publishes.
 *
 * Four separate defects were one line of URL splitting, and each is a different way of
 * being wrong, so each has its own assertion and each is asserted against the thing a
 * reader would notice:
 *
 *   - **A heading that is a URL slug.** The index printed `data-contract` where the rail
 *     beside it, and the section's own `meta.json`, both print `Unified data contract
 *     (approved)`. An index whose own headings are worse names than its own navigation is
 *     the index being the worst label on the page.
 *   - **A heading with no words.** `content/docs/index.mdx` routes at `/docs`, so the
 *     segment above it is `undefined` and the template printed an empty `<h2>` in the body
 *     and an empty `data-slot="docs-nav-label"` in the rail. Both are asserted, because
 *     they were two halves of the same `?? ''`.
 *   - **A card whose href is the page it is listed on.** `Introduction` linked to `/docs`,
 *     which is this page.
 *   - **A section listing itself.** Grouping by path put each section's own folder index
 *     inside that section, so six of the twenty-seven cards were a section's own heading
 *     restated as a card.
 *
 * The fixture below is built from `content/docs/**` rather than written out, so a corpus
 * that gains a section or reorders one cannot pass against a list this file froze. It
 * reproduces the tree the content pipeline publishes: the root `meta.json`'s order with
 * its rules, each folder's `meta.json` title and page order, and every node's `$ref`.
 *
 * **What jsdom cannot check, stated rather than asserted.** The grid is
 * `grid-template-columns: repeat(2, minmax(0, 1fr))` and jsdom has no layout engine:
 * `getBoundingClientRect()` is zeros and nothing computes a used value for `grid`, `fr`
 * or `minmax()`. The orphan a section used to end in - an odd number of cards leaving one
 * alone on a second row - is therefore not asserted here. It is not asserted anywhere
 * else either, and it is a consequence of the fourth defect rather than a separate one:
 * with each section's own page removed, the sections hold 4, 5, 2, 3, 4 and 2 cards.
 */
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'content', 'docs');

/** The six sections, in the order the root `meta.json` publishes them between its rules. */
function sectionFolders(): Array<{ folder: string; title: string; own: string }> {
  const rootMeta = JSON.parse(readFileSync(path.join(DOCS, 'meta.json'), 'utf8')) as {
    pages: string[];
  };
  return rootMeta.pages
    .filter((entry) => !entry.startsWith('---') && entry !== 'index')
    .map((folder) => {
      const meta = JSON.parse(readFileSync(path.join(DOCS, folder, 'meta.json'), 'utf8')) as {
        title: string;
      };
      return { folder, title: meta.title, own: `/docs/${folder}` };
    });
}

/** One frontmatter field, as the content pipeline reads it. */
function field(file: string, name: 'title' | 'description'): string {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'))?.[1] ?? '';
  return new RegExp(`^${name}:\\s*(.+)$`, 'm').exec(block)?.[1]?.trim() ?? '';
}

/**
 * The page tree, as `docsSource.getPageTree()` publishes it.
 *
 * The separator names are read off the `---name---` entries rather than invented, and the
 * `$ref` on every folder and page is set, because `isFolderPage()` reads the folder's own
 * file path and a fixture without one would pass against a function that reads nothing.
 */
function tree(): Root {
  const rootMeta = JSON.parse(readFileSync(path.join(DOCS, 'meta.json'), 'utf8')) as {
    pages: string[];
  };

  const children: Root['children'] = rootMeta.pages.map((entry) => {
    const separator = /^---(.*)---$/.exec(entry);
    if (separator) return { type: 'separator', name: separator[1] ?? '' };
    if (entry === 'index') {
      const file = path.join(DOCS, 'index.mdx');
      return {
        type: 'page',
        name: field(file, 'title'),
        description: field(file, 'description'),
        url: '/docs',
        $ref: 'index.mdx',
      };
    }
    const meta = JSON.parse(readFileSync(path.join(DOCS, entry, 'meta.json'), 'utf8')) as {
      title: string;
      pages: string[];
    };
    return {
      type: 'folder',
      name: meta.title,
      $ref: { folder: entry, meta: `${entry}/meta.json` },
      children: meta.pages.map((name) => {
        const file = path.join(DOCS, entry, `${name}.mdx`);
        return {
          type: 'page',
          name: field(file, 'title'),
          description: field(file, 'description'),
          url: `/docs/${entry}${name === 'index' ? '' : `/${name}`}`,
          $ref: `${entry}/${name}.mdx`,
        };
      }),
    };
  });

  return { type: 'root', name: 'AlphaLens docs', children };
}

const LABELS = { nav: 'Documentation', toc: 'On this page', pager: 'Adjacent pages' } as const;

/** The index, rendered. */
function renderIndex() {
  render(<DocsIndex tree={tree()} labels={LABELS} />);
}

/** The `<h2>` a section prints over its cards. */
function headings(): string[] {
  return [...document.querySelectorAll('.site-docs-section__title')].map((node) => node.textContent ?? '');
}

/** Every card's `href`, in the order the index prints them. */
function cards(): Array<{ href: string; title: string; section: string }> {
  return [...document.querySelectorAll('.site-docs-section')].flatMap((section) => {
    const heading = section.querySelector('.site-docs-section__title')?.textContent ?? '';
    return [...section.querySelectorAll('.site-docs-index__card')].map((card) => ({
      href: card.getAttribute('href') ?? '',
      title: card.querySelector('.site-docs-index__title')?.textContent ?? '',
      section: heading,
    }));
  });
}

/** A lowercase hyphenated token, which is what a URL slug is and a section name is not. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe('a documentation section is named by the tree, not by its path', () => {
  it('prints no heading that is a URL slug', () => {
    renderIndex();
    // The four sections whose `meta.json` title differs from the folder name, plus the
    // three that carry an honesty status inside the title, all of which a slug cannot.
    for (const heading of headings()) {
      expect(heading, `"${heading}" is a URL slug, not a section name`).not.toMatch(SLUG);
    }
    expect(headings()).toEqual(sectionFolders().map((section) => section.title));
  });

  it('prints no heading with no words, in the body or in the rail', () => {
    renderIndex();
    for (const heading of headings()) {
      expect(heading.trim().length, 'an empty heading in the index body').toBeGreaterThan(0);
    }
    // The same defect had a second half. The rail's own label is a different template and
    // it printed an empty `data-slot="docs-nav-label"` span beside the same section, so it
    // is asserted separately rather than assumed to follow the body.
    const labels = [...document.querySelectorAll('[data-slot="docs-nav-label"]')];
    expect(labels.length).toBe(sectionFolders().length);
    for (const label of labels) {
      expect(label.textContent?.trim().length ?? 0, 'an empty section label in the rail').toBeGreaterThan(0);
    }
  });

  it('uses the same six names in the rail that the body uses as headings', () => {
    renderIndex();
    const rail = screen.getByRole('navigation', { name: LABELS.nav });
    const railNames = [...rail.querySelectorAll('[data-slot="docs-nav-label"]')].map(
      (label) => label.textContent ?? '',
    );
    expect(railNames).toEqual(headings());
  });

  it('prints the sections in the order the tree publishes them', () => {
    renderIndex();
    const published = sectionFolders().map((section) => section.folder);
    expect(headings()).toEqual(sectionFolders().map((section) => section.title));
    // The order is not alphabetical, and the assertion is about that rather than about the
    // names: the caller used to sort the flat page list by title before grouping, which
    // made the section order a function of which section held the alphabetically first
    // title. `research-directions` came out above `data-platform`, so the pipeline read
    // backwards. This fails the moment a sort comes back.
    const alphabetical = [...published].sort();
    expect(published).not.toEqual(alphabetical);
    expect(headings().map((heading) => published[sectionFolders().findIndex((s) => s.title === heading)])).toEqual(
      published,
    );
  });
});

describe('the index lists destinations, not itself', () => {
  it('carries no card whose href is the index own address', () => {
    renderIndex();
    // `/docs` is this page: `content/docs/index.mdx` is the Introduction, the optional
    // catch-all's root arm claims that address, and `scripts/check-routes.mjs` records the
    // document as deliberately published nowhere. A card for it is a link to the page the
    // reader is on.
    const selfLinks = cards().filter((card) => card.href === '/docs');
    expect(selfLinks.map((card) => card.title), 'a card links to the page it is listed on').toEqual([]);
  });

  it('files no section own folder index under that section', () => {
    renderIndex();
    for (const section of sectionFolders()) {
      const listed = cards()
        .filter((card) => card.section === section.title)
        .map((card) => card.href);
      expect(listed, `${section.title} lists its own folder index`).not.toContain(section.own);
      // And the removal is specific rather than a filter on the slug: the section's other
      // documents are still there, so the assertion above cannot pass by emptying a
      // section.
      expect(listed.length, `${section.title} lost documents it should keep`).toBeGreaterThan(0);
    }
  });

  it('keeps a document with no section above it out of the list entirely', () => {
    renderIndex();
    // The root document is the one case this corpus has, and it has no heading to sit
    // under: the section heading is this index's only structure, so printing it under
    // whichever section came first would file it in a section it is not in.
    const introduction = field(path.join(DOCS, 'index.mdx'), 'title');
    for (const card of cards()) {
      expect(card.title, `${card.title} is filed under ${card.section} and is in no section`).not.toBe(
        introduction,
      );
    }
  });
});
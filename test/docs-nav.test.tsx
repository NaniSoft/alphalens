import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DocArticle, type DocArticlePage } from '@/components/DocArticle';
import { toPrismTree } from '@/lib/to-prism-tree';

/**
 * A documentation section is a label, and this file is the assertion.
 *
 * The retired template spelled "a section has no route of its own" as `url: ''` and then
 * carried a stylesheet rule styling the resulting anchor-with-no-href back into a label,
 * with `pointer-events: none` so it could not be clicked. The rendered HTML therefore said
 * `<a href="">` for a thing that is not a destination, and the stylesheet existed to
 * contradict the markup. `pointer-events: none` is the clearest possible evidence that
 * the markup was lying about itself: something that is not a control does not need
 * pointer-events disabled.
 *
 * The design system now makes the case a type: `DocsNavGroup.href` is optional, and a
 * group without one renders a `span`. So the same fact is expressed by the absence of a
 * prop, and the two stylesheet rules that styled the lie are deleted rather than kept.
 *
 * **The honesty status is words inside the title, and nothing is drawn beside it.** That
 * is the constraint the ticket singles out, and it is easy to undo by accident: a badge,
 * a count or a collapse control beside a section whose title carries a status each say
 * that the sections are independent topics a reader may visit in any order, and four of
 * this site's six sections describe a pipeline where that is exactly wrong. A status in
 * the title is content; a badge beside it is a claim about the section's state. So the
 * assertions below are about the absence of affordances, not only their presence.
 */
const ROOT = path.resolve(__dirname, '..');

/** The six sections, with the honesty status each one's title carries. */
const SECTIONS: ReadonlyArray<{ slug: string; status: string }> = [
  { slug: 'data-platform', status: 'live' },
  { slug: 'data-contract', status: 'approved' },
  { slug: 'research-pipeline', status: 'designed' },
  { slug: 'research-directions', status: '' },
  { slug: 'engineering-story', status: '' },
  { slug: 'reference', status: '' },
];

const LABELS = { nav: 'Documentation', toc: 'On this page', pager: 'Adjacent pages' } as const;

/**
 * One documentation section as the content pipeline's own page tree describes it.
 *
 * A `Folder` carries no `url` and holds its index as an `Item`, which is why the section
 * heading and the section's first page entry are the same destination and why only one of
 * them should be a link. The fixture mirrors the real tree, so the assertions below are
 * about the shape the content pipeline publishes rather than about a shape invented here.
 */
function tree() {
  return {
    name: 'AlphaLens docs',
    children: SECTIONS.map((section) => ({
      type: 'folder' as const,
      name: section.slug,
      index: { type: 'page' as const, name: section.slug, url: `/docs/${section.slug}` },
      children: [],
    })),
  };
}

describe('a documentation section is a label, never a control', () => {
  it('omits the group href rather than passing an empty one', () => {
    const entries = toPrismTree(tree().children);

    for (const entry of entries) {
      expect(entry.type).toBe('group');
      // The key is absent, not empty. An empty string is a destination that resolves to
      // nothing, which is the exact thing the type exists to prevent. And a *populated*
      // href would be a second link to the section's own index page, which is already in
      // the section's items.
      expect(Object.hasOwn(entry, 'href')).toBe(false);
    }
  });

  it('renders no anchor, and nothing focusable, for a section heading', () => {
    render(
      <DocArticle
        labels={LABELS}
        page={{ url: '/docs/data-platform', data: { title: 'Data platform', body: () => null } }}
        tree={tree()}
      />,
    );

    const rail = screen.getByRole('navigation', { name: 'Documentation' });
    // Every anchor in the rail is a page with a destination. No section heading is one.
    for (const anchor of rail.querySelectorAll('a')) {
      expect(anchor.getAttribute('href'), 'an anchor in the rail with no destination').toBeTruthy();
    }
    // And the section names appear as text, which is what a label is.
    for (const section of SECTIONS) {
      expect(rail.textContent).toContain(section.slug);
    }
  });

  it('carries no badge, count, button or disclosure control anywhere in the rail', () => {
    render(
      <DocArticle
        labels={LABELS}
        page={{ url: '/docs/data-platform', data: { title: 'Data platform', body: () => null } }}
        tree={tree()}
      />,
    );

    const rail = screen.getByRole('navigation', { name: 'Documentation' });
    // A control is a button, a summary, a disclosure, or anything with `aria-expanded`.
    // Each of these would tell a reader that a section is a thing to be operated, and a
    // section is a stage of a pipeline.
    expect(rail.querySelectorAll('button, summary, [aria-expanded], [role="button"]')).toHaveLength(0);
    expect(rail.querySelectorAll('[data-slot="docs-nav-heading"]')).toHaveLength(0);
    // The label the design system emits for a group with no index, rather than the
    // heading it emits for one that has a route.
    expect(rail.querySelectorAll('[data-slot="docs-nav-label"]').length).toBe(SECTIONS.length);
  });

  it('puts the honesty status inside the section title, as words', () => {
    // The status lives in the content pipeline's own `meta.json`, not in the adapter, and
    // the adapter copies the title through untouched. That is the assertion: the title is
    // carried verbatim, so a status written there reaches the rendered heading as words and
    // nothing in this repository has to parse it out.
    for (const section of SECTIONS) {
      const meta = JSON.parse(
        readFileSync(path.join(ROOT, 'content', 'docs', section.slug, 'meta.json'), 'utf8'),
      ) as { title: string };
      if (section.status) {
        expect(meta.title, `${section.slug} must name its status in its own title`).toContain(section.status);
      }
      const entries = toPrismTree([
        {
          type: 'folder' as const,
          name: meta.title,
          index: { type: 'page' as const, name: meta.title, url: `/docs/${section.slug}` },
          children: [],
        },
      ]);
      expect(entries[0]).toMatchObject({ type: 'group', title: meta.title });
    }
  });

  it('never emits a pill, a badge or a count beside a section title', () => {
    // The adapter's *code*, with its comments blanked. The comment above this assertion
    // names the badge, the pill and the count, and scanning raw text would fail on the
    // documentation of the rule rather than on the rule.
    const code = readFileSync(path.join(ROOT, 'lib', 'to-prism-tree.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
      .replace(/(^|[^:])\/\/[^\n]*/g, (line) => line.replace(/[^\n]/g, ' '));
    // The adapter is a pure translation from one shape to another. The moment it
    // recognises a word in a title, it has become a Page with opinions about a
    // consumer's data, which is the thing the design system says a Page must not be.
    expect(code).not.toMatch(/\btest\(|\bmatch\(|\.replace\(/);
    expect(code, 'the adapter emits a badge, a pill or a count beside a section title').not.toMatch(
      /Badge|badge|count|pill|Pill/,
    );
    expect(code, 'the adapter reads a status word out of a title').not.toMatch(/status/i);
  });

  it('reads the whole corpus, so the section list is not a hand-written subset', () => {
    const sections = readdirSync(path.join(ROOT, 'content', 'docs'), { withFileTypes: true }).filter((entry) =>
      entry.isDirectory(),
    );
    expect(sections.length).toBe(SECTIONS.length);
  });
});

/**
 * One document's contents rail, given the titles as the heading plugin hands them over.
 *
 * fumadocs fills `toc[].title` with a heading's own children wrapped in a fragment, so
 * the value that reaches the page is an element even for a heading with no markup in it.
 * Every fixture below is shaped that way, because a bare string is the one shape this
 * pipeline does not produce, and a fixture that used one would pass against the bug.
 */
function contentsRail(toc: NonNullable<DocArticlePage['data']['toc']>): HTMLElement {
  render(
    <DocArticle
      labels={LABELS}
      page={{
        url: '/docs/reference/feed-fields',
        data: { title: 'Feed field reference', body: () => null, toc },
      }}
      tree={tree()}
    />,
  );
  return screen.getByRole('navigation', { name: LABELS.toc });
}

describe('a contents rail entry is named by the words in its own heading', () => {
  it('resolves an element title to the text inside it, nested elements included', () => {
    const rail = contentsRail([
      { title: <>{'Columns'}</>, url: '#columns', depth: 2 },
      { title: <>{'Option chain '}<code>live</code></>, url: '#option-chain-live', depth: 3 },
      { title: <>{['Per-source ', <em key="e">field</em>, ' detail']}</>, url: '#per-source', depth: 3 },
    ]);

    expect(rail.querySelector('a[href="#columns"]')?.textContent).toBe('Columns');
    expect(rail.querySelector('a[href="#option-chain-live"]')?.textContent).toBe('Option chain live');
    expect(rail.querySelector('a[href="#per-source"]')?.textContent).toBe('Per-source field detail');
  });

  it('drops an entry whose title resolves to nothing rather than forwarding a blank one', () => {
    // A nameless entry reaches the design system as a label rather than a link, so it
    // draws a row of nothing inside the rail. Dropping it here is the whole fix: the
    // rail is the whole outline or none of it, and a row with no words is not a place in
    // the document. The whitespace-only title is the same case with a space in front of
    // it, and is dropped for the same reason.
    const rail = contentsRail([
      { title: <>{'Columns'}</>, url: '#columns', depth: 2 },
      { title: <>{null}</>, url: '#nameless', depth: 2 },
      { title: <>{'   '}</>, url: '#blank', depth: 3 },
    ]);

    expect(rail.querySelectorAll('a')).toHaveLength(1);
    expect(rail.querySelector('a[href="#nameless"]')).toBeNull();
    expect(rail.querySelector('a[href="#blank"]')).toBeNull();
    // Nothing in the rail renders Prism's label half, which is the slot an entry with no
    // address or no words falls back to.
    expect(rail.querySelectorAll('[data-slot="docs-nav-label"]')).toHaveLength(0);
  });

  it('keeps the two-level promise while naming every entry it keeps', () => {
    // The filter is the reason the rail can be trusted, and dropping an entry because it
    // resolved to nothing must not become a reason to widen the filter.
    const rail = contentsRail([
      { title: <>{'Feed field reference'}</>, url: '#top', depth: 1 },
      { title: <>{'Columns'}</>, url: '#columns', depth: 2 },
      { title: <>{'Option chain'}</>, url: '#option-chain', depth: 3 },
      { title: <>{'Step one'}</>, url: '#step-one', depth: 4 },
    ]);

    expect([...rail.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href'))).toEqual([
      '#columns',
      '#option-chain',
    ]);
  });
});

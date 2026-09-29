import { readFileSync } from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import { HERO_FIGURE, HERO_STAGES } from '@/lib/content';

// jsdom has no IntersectionObserver and a partial matchMedia; the landing's
// reveal root must tolerate both.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  if (!('IntersectionObserver' in globalThis)) {
    (globalThis as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver =
      MockIntersectionObserver;
  }
  window.matchMedia =
    window.matchMedia ?? (() => ({ matches: true, addListener() {}, removeListener() {} }) as never);
});

const ROOT = path.resolve(__dirname, '..');

/**
 * The six numbered sections' headings, and nothing else.
 *
 * Selected by their index rather than by taking every `h2`, because the closing call to
 * action is an `h2` too and is not a numbered section. The index is the catalogue's own
 * `eyebrow` above the title, rendered in the mono face, so this reads the numbering the
 * page publishes rather than a class this repository no longer owns.
 */
function numberedSections(): string[] {
  return [...document.querySelectorAll('h2')]
    .filter((heading) => {
      const eyebrow = heading.parentElement?.querySelector('[data-slot="section-heading"] span, span');
      return /^\d{2}$/.test(eyebrow?.textContent?.trim() ?? '');
    })
    .map((heading) => heading.textContent ?? '');
}

/**
 * The landing, rendered as a reader meets it.
 *
 * Every assertion here is about copy the site publishes or about a destination a reader
 * can follow, because the migration's destination is that the content does not change.
 * The rendered structure is asserted only where a structural claim is the claim: the six
 * numbered sections and the status in each section's own heading.
 */
describe('the alphalens landing', () => {
  it('leads with the live data layer, not the destination', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('minute by minute');
  });

  it('carries the standing status note', () => {
    render(<HomePage />);
    expect(screen.getAllByText(/in active development/i).length).toBeGreaterThan(0);
  });

  it('renders the six numbered sections, in order', () => {
    render(<HomePage />);
    const headings = numberedSections();
    expect(headings).toHaveLength(6);
    expect(headings).toEqual([
      'What it captures (live)',
      'The data path (live)',
      'One feed for research (approved)',
      'The research pipeline (designed, not built)',
      'Where it’s going (research direction)',
      'Built on Nexus',
    ]);
  });

  it('puts the honesty status inside each section title and draws no badge beside it', () => {
    render(<HomePage />);
    // The status is words in the title, which is content. What is forbidden beside a
    // heading is a claim about the section's state: a pill, a count, a disclosure
    // control, a button. Each would say the six sections are independent topics a reader
    // may visit in any order, and four of them are a pipeline where that is wrong.
    const statuses = ['live', 'approved', 'designed, not built', 'research direction'];
    const headings = screen.getAllByRole('heading', { level: 2 });
    for (const status of statuses) {
      expect(
        headings.some((heading) => (heading.textContent ?? '').includes(status)),
        `no section title carries "${status}"`,
      ).toBe(true);
    }
    for (const heading of headings) {
      const beside = heading.parentElement?.querySelectorAll('button, [role="button"], summary, [aria-expanded]');
      expect(beside?.length ?? 0, `a control beside the section heading "${heading.textContent}"`).toBe(0);
    }
  });

  it('labels the research directions as not built', () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Research direction · not built/i).length).toBe(3);
  });

  it('labels the research pipeline rows as designed', () => {
    render(<HomePage />);
    // Six agent rows, each with the tier's words beside it. The retired page printed the
    // word "designed" on every row and the count was six; the ledger's tier words are the
    // caller's, so the same six rows carry them.
    expect(screen.getAllByText(/^designed$/i).length).toBe(6);
  });

  it('shows the built-on-nexus platform story', () => {
    render(<HomePage />);
    expect(screen.getByText(/The Agent Factory/)).toBeTruthy();
  });

  it('makes the hero actions real links with destinations', () => {
    render(<HomePage />);
    // The one rendered change the whole migration exists to make: the retired page passed
    // a destination to a component that rendered a button, so the page's primary action
    // was announced as a command that navigated nothing.
    const readTheDocs = screen.getAllByRole('link', { name: 'Read the docs' })[0] as HTMLElement;
    expect(readTheDocs, 'the hero has no "Read the docs" link').toBeTruthy();
    expect(readTheDocs.tagName).toBe('A');
    expect(readTheDocs.getAttribute('href')).toBe('/docs');
    const readTheBlog = screen.getAllByRole('link', { name: 'Read the blog' })[0] as HTMLElement;
    expect(readTheBlog, 'the hero has no "Read the blog" link').toBeTruthy();
    expect(readTheBlog.getAttribute('href')).toBe('/blog');
  });

  it('draws the documented stages running, and no canvas', () => {
    render(<HomePage />);
    // The retired hero drew open interest from a sine hash under a label reading as a
    // live feed. What is here instead is the four stages the collector runs, which the
    // site documents and a reader can check, drawn on a rail with a marker travelling
    // it once per market minute.
    //
    // The figure is a `PulseGraph` rather than the static `Diagram` it was, and the two
    // carry the same four stages. What is new is that each stage is a lane, so the order
    // reads as an order, and that every edge grows a head. None of that is decoration:
    // a reader who stops every animation sees the same four stages in the same order,
    // which is the test the design system's second law of motion sets.
    const figure = document.querySelector('[data-slot="pulse-graph"]');
    expect(figure).toBeTruthy();
    // The name is read from the content module rather than matched against a phrase,
    // because the aria sentence is published copy and a test that hard-codes its
    // wording would fail on a rewrite that changed nothing about the drawing.
    expect(figure?.getAttribute('aria-label')).toBe(HERO_FIGURE.aria);
    for (const stage of HERO_STAGES) {
      expect(figure?.textContent ?? '').toContain(stage.name.toLowerCase());
    }
    expect(document.querySelector('canvas')).toBeNull();

    // The rail and its marker are the claim about order, and both are in the initial
    // HTML rather than drawn by a loop this page owns.
    expect(figure?.querySelector('[data-slot="pulse-graph-rail-line"]')).toBeTruthy();
    expect(figure?.querySelector('[data-slot="pulse-graph-marker"]')).toBeTruthy();
    expect(document.querySelector('.prism-ambient-travel')).toBeTruthy();

    // Four stages, four lanes, three carrying edges, and no market values on it: the
    // panel's disclosure describes the drawing rather than apologising for it.
    expect(figure?.querySelectorAll('[data-slot="pulse-graph-node"]')).toHaveLength(4);
    expect(figure?.querySelectorAll('[data-lane]')).toHaveLength(4);
    expect(figure?.querySelectorAll('[data-slot="pulse-graph-flow"]')).toHaveLength(3);
  });

  it('carries the disclosure a market-shaped surface owes, in the panel a reader sees', () => {
    render(<HomePage />);
    const panel = document.querySelector('[data-slot="instrument-panel"]');
    const footnote = panel?.querySelector('[data-slot="instrument-panel-footnote"]');
    expect(footnote?.textContent ?? '').toMatch(/no market values are drawn/i);
    // And the label no longer reads as a feed.
    expect(panel?.getAttribute('data-state') ?? 'neutral').toBe('neutral');
  });

  it('draws the rail as exactly the four stages the collector runs', () => {
    render(<HomePage />);
    // `ProcessRail01` declares its steps as a tuple of two, three or four, so five is a
    // compile error and not a fifth column. The rendered count is asserted because a
    // Block that quietly dropped a stage would be a diagram of a process that is not the
    // process.
    const steps = document.querySelectorAll('[data-slot="process-step"]');
    expect(steps.length).toBe(4);
    // Each step is an ordinal, the final label on the last one, a name and a caption. The
    // name is the first span carrying the step's own weight, so the assertion reads the
    // slots the Block emits rather than a child index that would move with a layout
    // change.
    expect([...steps].map((step) => step.querySelector('.font-semibold')?.textContent)).toEqual([
      'Capture',
      'Store',
      'Summarize',
      'Archive',
    ]);
  });

  it('reads the content module, so the assertions above are about published copy', () => {
    // Every section title and every phrase this test checks comes from `lib/content.ts`,
    // and that file is the landing's copy. A test that asserted a hardcoded string would
    // pass on a site that published nothing, so the section list is read from the module
    // and compared against what rendered.
    const content = readFileSync(path.join(ROOT, 'lib', 'content.ts'), 'utf8');
    const sections = /export const SECTIONS = \[([\s\S]*?)\] as const;/.exec(content)?.[1] ?? '';
    expect(sections, 'lib/content.ts no longer declares the section list').not.toBe('');
    const labels = [...sections.matchAll(/label: '([^']+)'/g)].map((match) => match[1] ?? '');
    const statuses = [...sections.matchAll(/status: '([^']*)'/g)].map((match) => match[1] ?? '');

    render(<HomePage />);
    const headings = numberedSections();
    expect(headings).toHaveLength(labels.length);
    labels.forEach((label, at) => {
      const status = statuses[at] ?? '';
      expect(headings[at]).toBe(status ? `${label} (${status})` : label);
    });
    expect(content).toContain('The Agent Factory');
  });
});

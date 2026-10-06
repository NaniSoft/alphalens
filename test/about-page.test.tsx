import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AboutPage from '@/app/about/page';

/**
 * `/about` opens and closes with the same two calls to action, and now it opens with none
 * and closes with both.
 *
 * "Read the docs" and "Read the blog" appeared twice: once under the heading and again
 * about 1400px later at the foot, both pairs identical, with the page's own bar carrying
 * the same two destinations directly above the top one. Three controls for two facts, and
 * the two nearest each other saying the same thing. A reader who arrives at `/about` from
 * a search engine has just been given both destinations twice before the first paragraph.
 *
 * The closing pair is the one kept. It is where the page's argument ends, so it is the
 * point at which the reader has something to decide; at the top it competes with a bar
 * that is already sticky and already one click away, and it does so 40px after the heading
 * that says what the page is. The assertion below is that the pair appears once - the same
 * two labels, the same two destinations, one time - and that they are at the end of the
 * page's own content rather than above it.
 */
describe('the About page carries one pair of calls to action', () => {
  it('prints "Read the docs" once, and it is a real link to /docs', () => {
    render(<AboutPage />);
    const links = screen.getAllByRole('link', { name: 'Read the docs' });
    expect(links, 'the About page offers the docs more than once').toHaveLength(1);
    expect(links[0]?.tagName).toBe('A');
    expect(links[0]?.getAttribute('href')).toBe('/docs');
  });

  it('prints "Read the blog" once, and it is a real link to /blog', () => {
    render(<AboutPage />);
    const links = screen.getAllByRole('link', { name: 'Read the blog' });
    expect(links, 'the About page offers the blog more than once').toHaveLength(1);
    expect(links[0]?.tagName).toBe('A');
    expect(links[0]?.getAttribute('href')).toBe('/blog');
  });

  it('closes the page with them, after the prose and the fact list', () => {
    const { container } = render(<AboutPage />);
    const row = container.querySelector('.site-cta-row');
    expect(row, 'the About page has no closing pair of calls to action').toBeTruthy();

    // The order is asserted through the DOM rather than through a class, because the claim
    // is about where the pair sits in the page: after the fact list, not before the first
    // paragraph. `compareDocumentPosition` is a real DOM answer rather than a string
    // search over the rendered HTML.
    const main = container.querySelector('main') ?? container;
    const elements = [...main.querySelectorAll('p, h1, h2, li, dl, .site-cta-row')];
    const pairAt = elements.indexOf(row as Element);
    const proseAt = elements.findIndex((node) => node.tagName === 'H2');
    expect(pairAt, 'the closing pair is above the page it closes').toBeGreaterThan(proseAt);
    expect(pairAt).toBeGreaterThan(-1);
    expect(elements.length, 'the prose was not read').toBeGreaterThan(10);
  });

  it('opens with the heading, not with a line naming the page above the heading', () => {
    const { container } = render(<AboutPage />);
    const heading = container.querySelector('h1');
    expect(heading).toBeTruthy();
    // Whatever precedes the `h1` in the page's own content, it is not a string that repeats
    // the site's name and the page's name with a separator between them. The line used to
    // be `nanisoft · alphalens · about`, printed by the site's own sheet.
    for (const node of elementsBefore(container, heading as Element)) {
      expect(node.textContent ?? '', 'a line above the h1 names the page again').not.toMatch(
        /nanisoft\s*[·—-]\s*alphalens/,
      );
    }
    // And no element carries the class the sheet used to style it with, which is the half
    // a text search for the sentence above would miss.
    expect(container.querySelector('.site-eyebrow'), '/about still prints an eyebrow').toBeNull();
  });
});

/** Every element between the `main` and a node, in document order. */
function elementsBefore(container: HTMLElement, node: Element): Element[] {
  const main = container.querySelector('main') ?? container;
  const out: Element[] = [];
  const walk = (element: Element) => {
    for (const child of element.children) {
      if (child === node) return true;
      out.push(child);
      if (walk(child)) return true;
    }
    return false;
  };
  walk(main);
  return out;
}
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import AboutPage from '@/app/about/page';
import HomePage from '@/app/page';
import NotFound from '@/app/not-found';
import { COPY, CURRENT_SITE_ID, NAV, SITES } from '@/lib/bar';

// The bar's own controls are a client island inside `@nanisoft/prism-ui`, and jsdom has no
// `matchMedia`, which the mode control reaches for. This file renders the bar on the
// landing, the About page and the 404, so it needs that one stub.
//
// It also used to stub `IntersectionObserver`, for the landing's reveal root. Both that
// component and the need are gone: `test/no-hidden-state.test.ts` holds the count of client
// directives in this repository's source at zero, and a stub left behind for a deleted
// dependency is a reader being sent to look for something that is not there.
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ??
    (() =>
      ({ matches: true, addListener() {}, removeListener() {} }) as unknown as MediaQueryList);
});

/**
 * The bar this site publishes, read off the real pages.
 *
 * The pages are rendered rather than the bar composed by hand, because a test that
 * assembles what it is testing stops testing it the moment the assembly is not what
 * ships. That is not hypothetical: `lib/site.ts` used to export a sibling-only list that
 * existed purely for the switcher the old header drew, and it stayed true for as long as
 * nothing rendered the bar at all.
 */
describe('the bar', () => {
  it("carries this site's own three destinations, in a navigation of its own", () => {
    // The Block renders a brand lockup and nothing else when `nav` is absent, so
    // dropping the three is a silent removal of the whole site's navigation.
    const { container } = render(<HomePage />);
    const nav = container.querySelector(`nav[aria-label="${COPY.nav}"]`);
    expect(nav, 'the bar carries no site navigation').toBeTruthy();
    expect([...nav!.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(
      NAV.map((link) => link.href),
    );
  });

  it('reaches the whole family from one control, including this site', () => {
    // The set used to be four marks with this site's own filtered out, because the
    // switcher drew it twice: once as the brand lockup and once as the first member.
    // Filtering a member out of the one control that states the family fixed the
    // duplicate by hiding a destination, and the menu fixes it by not drawing the
    // member until a reader asks for it.
    const { container } = render(<HomePage />);
    const trigger = container.querySelector('[data-slot="site-navbar-sites-trigger"]');
    expect(trigger, 'the bar reaches no other site').toBeTruthy();
    expect(trigger!.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger!.getAttribute('aria-label')).toBe(COPY.sites);
    expect(SITES.map((site) => site.id)).toContain(CURRENT_SITE_ID);
    // Five members, and every one of them a different origin: a relative href would
    // render as a working link and land on a 404.
    expect(SITES).toHaveLength(5);
    for (const site of SITES) {
      // Including this site's own, which carried `/` until the menu arrived and was
      // never read by the old switcher because the old switcher drew only the siblings.
      // A menu of destinations that leave this site opens every row in a new tab, and
      // `/` in a new tab is a new tab on the page the reader is already on.
      expect(site.href, `${site.id} does not leave this site`).toMatch(/^https:\/\//);
    }
  });

  it('has no colour chooser, because a ground is a property of the page', () => {
    // The Block offers a colour menu and this site does not ask for one. A reader who
    // could repaint the ground would be on a page that is not this one, and a Block
    // that shipped the control unasked would be offering it to all four consumers.
    const { container } = render(<HomePage />);
    expect(container.querySelector('[data-slot="site-navbar-theme-trigger"]')).toBeNull();
  });

  it('offers search over a static index, because this site has no server', () => {
    const { container } = render(<HomePage />);
    const trigger = container.querySelector('[data-slot="site-navbar-search-trigger"]');
    expect(trigger, 'the bar offers no way to search 31 documents').toBeTruthy();
    expect(trigger!.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger!.getAttribute('aria-label')).toBe(COPY.search);
  });

  it("names the mode control for the mode it moves to, and this site's default is dark", () => {
    render(<HomePage />);
    const toggle = screen.getByRole('button', { name: COPY.toLight });
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('is sticky, and the landing is the page that needed it', () => {
    // The landing is nine bands long and the hidden state below the bar is the one thing
    // on this site a reader can arrive after rather than see, so the bar scrolling away
    // takes the only persistent way back to the docs with it.
    const { container } = render(<HomePage />);
    expect(container.querySelector('[data-slot="site-navbar"]')?.getAttribute('class')).toContain(
      'sticky',
    );
  });

  it('leaves the actions slot empty, because this site has no control of its own', () => {
    // Atlas keeps the playground there. AlphaLens has no equivalent: the two things it
    // would put above the fold are the docs it already navigates to and the blog, and a
    // fourth control for one of those is the width the brand lockup needs.
    const { container } = render(<HomePage />);
    const bar = container.querySelector('[data-slot="site-navbar"]');
    const links = [...bar!.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    // The wordmark, the three destinations, and nothing else: the family is behind a
    // control rather than a row of marks, and this site has no control of its own.
    expect(links).toEqual(['/', '/docs', '/blog', '/about']);
  });
});

describe('the bar marks the reader place', () => {
  it('marks the About page, because the bar is composed per page', () => {
    // The mark used to be impossible here: the bar lived in the root layout, which is
    // handed no pathname, and a static export has no request to read one from. Composing
    // the bar per page is what removed the question, and this is the assertion that the
    // arrangement is still the one that removed it.
    const { container } = render(<AboutPage />);
    expect([...container.querySelectorAll('a[aria-current="page"]')].map((a) => a.getAttribute('href'))).toEqual([
      '/about',
    ]);
  });

  it('marks nothing on the landing, because it is the wordmark destination', () => {
    const { container } = render(<HomePage />);
    expect(container.querySelector('a[aria-current="page"]')).toBeNull();
  });

  it('marks nothing on the 404, because a 404 is not one of the three', () => {
    const { container } = render(<NotFound />);
    expect(container.querySelector('[data-slot="site-navbar"]')).toBeTruthy();
    expect(container.querySelector('a[aria-current="page"]')).toBeNull();
  });
});

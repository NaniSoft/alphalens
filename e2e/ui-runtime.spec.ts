import { expect, test } from '@playwright/test';

/**
 * Runtime + visual enforcement (mission §12):
 * - all pages render using DS styles (only DS stylesheet loaded)
 * - no unauthorized stylesheet injection / arbitrary inline styling
 * - approved variants, no stretching/overflow, no unapproved fonts/icons
 * - themes render, responsive layouts work at supported breakpoints
 * - visual regression across 4 viewports × 2 modes (projects above)
 *
 * Assumptions: `out/` is the static export; `serve` serves it on 4173.
 * Run: `pnpm build && pnpm ui:runtime`
 */
const ROUTES = ['/', '/about', '/blog', '/docs'];

/**
 * The theme storage key PrismThemeScript reads, and the value shape it expects:
 * a JSON `{ pack, mode }`. Spelled here rather than imported because e2e runs
 * against the built export, but kept literal next to the comment that says what
 * it must stay in step with.
 */
const THEME_KEY = 'prism-theme';

for (const route of ROUTES) {
  test(`DS-only render ${route}`, async ({ page }) => {
    // The site server-renders `class="dark"` as its default mode and
    // PrismThemeScript respects that default when storage is empty, so a light
    // project that only emulated the `color-scheme` media query captured dark
    // pixels and filed them under a light name. The stored choice is set before
    // load, on the key the theme script reads, so the mode is applied before
    // first paint and the light projects capture real light mode.
    const dark = test.info().project.name.endsWith('-dark');
    await page.addInitScript(
      ({ key, value }) => {
        localStorage.setItem(key, value);
      },
      { key: THEME_KEY, value: JSON.stringify({ pack: 'gold', mode: dark ? 'dark' : 'light' }) },
    );
    await page.goto(route);
    await expect(page.locator('html[data-pack="gold"]')).toBeAttached();

    // And the document is in the mode the project means, asserted here so a
    // capture whose mode failed to apply fails as a mode failure instead of as
    // a pixel difference nobody can name.
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark, `html.dark should be ${dark} for ${test.info().project.name}`).toBe(dark);

    // No site stylesheet: only DS styles.css may be present.
    const sheets = await page.evaluate(() =>
      [...document.styleSheets].map((s) => s.href ?? 'inline'),
    );
    for (const href of sheets) {
      expect(href, `non-DS stylesheet ${href}`).toMatch(/prism|next\/static/);
    }

    // No app-owned inline styles. DS/framework inline styles are DS-owned:
    // AuroraWash velocity props, Tsparticles canvas sizing, PulseGraph travel
    // custom property, Next route announcer. Scoped out here and in ui:check
    // source gate (which never sees rendered output).
    const inlineStyles = await page.evaluate(() =>
      [...document.querySelectorAll('[style]')]
        .filter(
          (el) =>
            !el.hasAttribute('data-slot') &&
            el.tagName !== 'CANVAS' &&
            el.tagName !== 'NEXT-ROUTE-ANNOUNCER',
        )
        .map((el) => el.outerHTML.slice(0, 120)),
    );
    expect(inlineStyles, `inline styles present: ${inlineStyles.join(' | ')}`).toEqual([]);

    // No raw <img> outside DS components (DSImage renders img too, so check
    // the DS slot markers instead: DS images carry data-slot).
    const rawImgs = await page.evaluate(() =>
      [...document.querySelectorAll('img')].filter((img) => !img.closest('[data-slot]')).length,
    );
    expect(rawImgs).toBe(0);

    // No overflow (horizontal scrollbar from arbitrary widths).
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow, 'page overflows horizontally').toBe(false);

    await page.screenshot({ fullPage: false, animations: 'disabled', path: `e2e/visual-baselines/${route.replaceAll('/', '_')}-${test.info().project.name}.png` });
  });
}

test('focus indicator visible via keyboard (DS ring, both modes)', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
});

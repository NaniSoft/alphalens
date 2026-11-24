import { vi } from 'vitest';

/**
 * The page's living medium is the design system's `TsparticlesField`, which draws
 * through the tsParticles engine. The engine needs a canvas and an OffscreenCanvas
 * that the jsdom environment does not provide, and a decorative background is not
 * a fact these tests assert, so the component is replaced with a null stub: the
 * rest of the page renders without it.
 */
vi.mock('@nanisoft/prism-ui/components/tsparticles-field', () => ({
  TsparticlesField: () => null,
}));

/**
 * jsdom ships no `matchMedia`, and the design system's components read it for
 * two things: a reader's motion preference (`prefers-reduced-motion`), which
 * answers "no" here the way a desktop with a mouse answers it, and width. The
 * DocsShell rail disclosure (prism-ui 1.13.0) reads `(min-width: 64rem)` on
 * mount and collapses the rail when the answer is "no", so a stub that answered
 * every query "no" would unmount the navigation in every test that renders a
 * docs page, and a site with no stub at all would crash on the missing function.
 * A min-width query therefore answers as a desktop viewport, which is the
 * arrangement the suite at large renders against; a test that needs the narrow
 * answer stubs `matchMedia` itself. Inert against prism-ui 1.12, which reads
 * `matchMedia` nowhere.
 */
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

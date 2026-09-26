import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import HomePage from '@/app/page';

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

  it('marks every numbered section with its honesty tier', () => {
    render(<HomePage />);
    for (const tier of ['live', 'approved', 'designed, not built', 'research direction']) {
      expect(document.querySelectorAll(`[data-tier="${tier}"]`).length).toBeGreaterThan(0);
    }
  });

  it('renders the six numbered sections', () => {
    render(<HomePage />);
    const indices = Array.from(document.querySelectorAll('.al-section__index')).map((node) => node.textContent);
    expect(indices).toEqual(['01', '02', '03', '04', '05', '06']);
  });

  it('labels the research directions as not built', () => {
    render(<HomePage />);
    expect(screen.getAllByText(/research direction · not built/i).length).toBe(3);
  });

  it('labels the tradingagents rows as designed', () => {
    render(<HomePage />);
    expect(screen.getAllByText(/^designed$/i).length).toBeGreaterThanOrEqual(6);
  });

  it('shows the built-on-nexus platform story', () => {
    render(<HomePage />);
    expect(screen.getByText(/The Agent Factory/)).toBeTruthy();
  });
});

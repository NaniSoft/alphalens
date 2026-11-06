import type { ReactElement } from 'react';

/**
 * The AlphaLens mark, at the sizes a page draws it.
 *
 * The lens over the whole market, condensed to the shapes that survive
 * twenty-two pixels: the market in as parallel ink rays, the lens bending them,
 * one point out. The arriving rays are `currentColor`, so the mark follows the
 * ink it sits beside, and the bent rays and the lens are the pack's own primary
 * through token classes, with the point in the brand ink, so a pack boundary
 * above it repaints the accent without touching this file. A logo that named a
 * hex would be the one element on the page a theme could not reach.
 */
export function AlphaLensLogo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="AlphaLens"
      className={className ? `site-logo ${className}` : 'site-logo'}
    >
      <g strokeLinecap="round" strokeWidth="2.5">
        <path d="M4 12 L17.5 12" stroke="currentColor" />
        <path d="M4 20 L17.5 20" stroke="currentColor" />
        <path d="M17.5 12 L28 16" className="site-logo__accent-stroke" />
        <path d="M17.5 20 L28 16" className="site-logo__accent-stroke" />
      </g>
      <circle cx="17.5" cy="16" r="6.5" className="site-logo__accent-stroke" />
      <circle cx="28" cy="16" r="1.9" className="site-logo__point" />
    </svg>
  );
}

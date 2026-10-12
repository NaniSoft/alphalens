import type { ReactElement } from 'react';

/**
 * The AlphaLens mark, at the sizes a page draws it.
 *
 * The lens over the open-interest profile the favicon carries, condensed to the
 * shapes that survive twenty-two pixels: the reticle, the axis, and three bars
 * of the chain. Every stroke is `currentColor`, so the mark follows the ink it
 * sits beside, and the centre bar is the pack's own primary through a token
 * class, so a pack boundary above it repaints the accent without touching this
 * file. A logo that named a hex would be the one element on the page a theme
 * could not reach.
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
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 21.5 H29" opacity="0.45" />
        <path d="M16 6 V26" opacity="0.3" />
        <circle cx="16" cy="21.5" r="6.4" />
      </g>
      <g fill="currentColor">
        <rect x="10" y="14" width="2.4" height="7.5" opacity="0.6" />
        <rect x="19.6" y="12" width="2.4" height="9.5" opacity="0.8" />
      </g>
      <rect x="14.8" y="10.5" width="2.4" height="11" className="site-logo__accent" />
    </svg>
  );
}

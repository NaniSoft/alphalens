/**
 * The research loop: four analysts, a trader, a risk gate and a reflector.
 *
 * It is a diagram of the design the page's ledger states in rows, not a picture
 * of a running system. The reflector's edge runs back to the analysts because
 * that is what makes a second run different from the first: the memory is the
 * product, and the loop is why the archive exists.
 *
 * The only movement is the reflector's ring, on the ambient pulse. Every node and
 * every word is present with the animation stopped, and the caption says the
 * pipeline is designed and not built.
 */
export function AnalystLoop() {
  return (
    <figure className="flex flex-col gap-3">
      <svg
        viewBox="0 0 1200 420"
        role="img"
        aria-label="The designed research loop: market, sentiment, news and fundamentals analysts feed a trader, a risk gate reviews the trader, and a reflector writes the outcome back to the analysts."
        className="hidden h-auto w-full sm:block"
      >
        <defs>
          <marker id="analyst-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-border" />
          </marker>
        </defs>

        <g className="text-border" stroke="currentColor" strokeWidth="1.5" fill="none">
          <path d="M 250 120 H 470" markerEnd="url(#analyst-arrow)" />
          <path d="M 250 300 H 470" markerEnd="url(#analyst-arrow)" />
          <path d="M 600 210 H 760" markerEnd="url(#analyst-arrow)" />
          <path d="M 890 210 H 1010" markerEnd="url(#analyst-arrow)" />
          <path d="M 1010 300 C 1010 390, 120 390, 120 300" strokeDasharray="6 8" markerEnd="url(#analyst-arrow)" />
        </g>

        <g className="fill-card stroke-border" strokeWidth="1.5">
          <rect x="70" y="80" width="180" height="80" rx="8" />
          <rect x="70" y="260" width="180" height="80" rx="8" />
          <rect x="470" y="170" width="130" height="80" rx="8" />
          <rect x="760" y="170" width="130" height="80" rx="8" />
          <rect x="1010" y="170" width="120" height="80" rx="8" />
        </g>

        <g className="fill-foreground" fontSize="18" fontWeight="600">
          <text x="160" y="112" textAnchor="middle">Market</text>
          <text x="160" y="136" textAnchor="middle" fontSize="12" fontWeight="400" className="fill-muted-foreground">OHLCV, indicators</text>
          <text x="160" y="292" textAnchor="middle">Sentiment</text>
          <text x="160" y="316" textAnchor="middle" fontSize="12" fontWeight="400" className="fill-muted-foreground">social posts</text>
          <text x="535" y="202" textAnchor="middle">News</text>
          <text x="535" y="226" textAnchor="middle" fontSize="12" fontWeight="400" className="fill-muted-foreground">company and macro</text>
          <text x="825" y="202" textAnchor="middle">Trader</text>
          <text x="825" y="226" textAnchor="middle" fontSize="12" fontWeight="400" className="fill-muted-foreground">one debate round</text>
          <text x="1070" y="202" textAnchor="middle">Risk</text>
          <text x="1070" y="226" textAnchor="middle" fontSize="12" fontWeight="400" className="fill-muted-foreground">oversight</text>
        </g>

        <g className="fill-muted-foreground" fontSize="12">
          <text x="535" y="290" textAnchor="middle">Fundamentals</text>
          <text x="535" y="310" textAnchor="middle">filings, statements</text>
        </g>

        <g className="fill-primary">
          <circle cx="1070" cy="300" r="8" />
        </g>
        <g className="stroke-primary fill-none" strokeWidth="1.5">
          <circle cx="1070" cy="300" r="16" className="prism-ambient-pulse" style={{ transformOrigin: '1070px 300px' }} />
        </g>
        <g className="fill-muted-foreground" fontSize="12">
          <text x="1070" y="336" textAnchor="middle">Reflector</text>
        </g>
      </svg>

      {/*
        The diagram's text is drawn in a 1200-unit canvas and at a phone width
        the labels render below the readable floor. The mobile form is the same
        loop as a list rather than a shrunken picture, which is the honest
        fallback: a reader gets every stage and every edge, in order.
      */}
      <ol className="flex flex-col gap-2 text-sm sm:hidden">
        <li className="border-border flex items-center justify-between gap-3 border-b pb-2">
          <span>Market, sentiment, news and fundamentals</span>
          <span className="text-muted-foreground font-mono text-mono">analysts</span>
        </li>
        <li className="border-border flex items-center justify-between gap-3 border-b pb-2">
          <span>Trader</span>
          <span className="text-muted-foreground font-mono text-mono">one debate round</span>
        </li>
        <li className="border-border flex items-center justify-between gap-3 border-b pb-2">
          <span>Risk</span>
          <span className="text-muted-foreground font-mono text-mono">oversight</span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span>Reflector writes the outcome back</span>
          <span className="text-muted-foreground font-mono text-mono">memory</span>
        </li>
      </ol>

      <figcaption className="text-muted-foreground text-pretty text-xs">
        The research pipeline, as designed. No agent runs today, and no research output exists. The
        dashed edge is the memory the reflector writes for the next run.
      </figcaption>
    </figure>
  )
}

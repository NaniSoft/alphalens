/**
 * The hero's market surface: one minute of the capture path, as a contract.
 *
 * It draws no prices. The twelve ticks are the eleven chain calls and the one
 * batched quote call the collector makes each market minute, and the field list
 * is the contract's own column names. The disclosure is visible and in the same
 * file as the surface, which is the honesty law this site holds: a market-shaped
 * drawing says what it is, in the words a reader can see, and never leaves the
 * retraction in the smallest type in the panel.
 *
 * The surface is HTML rather than SVG. It is a schedule and a column list, not a
 * chart, and a chart of invented values is the one thing this page must not
 * become. The strip is decorative and hidden from assistive technology; the
 * labels around it carry the meaning.
 */
const FIELDS = [
  ['ts_utc', 'one timestamp'],
  ['symbol', 'NSE:NIFTY'],
  ['category', 'price, chain'],
  ['source', 'the collector'],
  ['ltp', 'last traded'],
  ['bid / ask', 'at capture'],
  ['volume', 'traded'],
  ['oi', 'open interest'],
] as const

export function MarketSurface() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-muted-foreground font-mono text-mono uppercase">one market minute</span>
        <span className="font-mono text-mono">11 + 1 calls</span>
      </div>

      <div className="grid grid-cols-12 items-end gap-1" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={index}
            className={
              index === 7
                ? 'bg-primary block h-8 rounded-sm'
                : 'bg-border block h-4 rounded-sm'
            }
          />
        ))}
      </div>

      <div className="text-muted-foreground flex justify-between font-mono text-mono">
        <span>09:15</span>
        <span>15:30</span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-mono">
        {FIELDS.map(([field, meaning]) => (
          <div key={field} className="flex items-baseline justify-between gap-2">
            <dt className="text-foreground">{field}</dt>
            <dd className="text-muted-foreground truncate">{meaning}</dd>
          </div>
        ))}
      </dl>

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        The contract, field by field. No market values are drawn.
      </p>
    </div>
  )
}

/**
 * The capture calendar: the days the collector has actually run.
 *
 * The dates are published facts, not a generated streak. The collector went live
 * on 26 August 2026, moved onto Kubernetes on 8 September, and the unified
 * contract was approved on 19 September. The calendar shades the live period and
 * marks the two later dates with a ring, so a reader can see the difference
 * between "collecting" and "approved" without reading a table.
 *
 * It is a figure, not a chart: no market values, no fabricated uptime, and no
 * number that is not in the site's own documents. The grid is decorative to a
 * screen reader; the sentence below it carries the same fact.
 */
const LIVE_FROM = new Date(Date.UTC(2026, 7, 26))
const KUBERNETES_FROM = new Date(Date.UTC(2026, 8, 8))
const CONTRACT_APPROVED = new Date(Date.UTC(2026, 8, 19))
// The build date, so the shaded range follows the deployment rather than a
// hand-maintained constant. The dates before it are the site's published facts.
const TODAY = new Date()

const MONTHS = [
  { year: 2026, month: 7, label: 'August' },
  { year: 2026, month: 8, label: 'September' },
  { year: 2026, month: 9, label: 'October' },
  { year: 2026, month: 10, label: 'November' },
] as const

const dayKey = (date: Date) => date.toISOString().slice(0, 10)

const LIVE_KEY = dayKey(LIVE_FROM)
const KUBERNETES_KEY = dayKey(KUBERNETES_FROM)
const APPROVED_KEY = dayKey(CONTRACT_APPROVED)
const TODAY_KEY = dayKey(TODAY)

function monthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1))
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  // Monday first, which is the week the market runs on. The extra six blanks are
  // the leading weekdays before the first of the month.
  const lead = (first.getUTCDay() + 6) % 7
  return [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, index) => {
      const date = new Date(Date.UTC(year, month, index + 1))
      return { date, key: dayKey(date) }
    }),
  ]
}

export function CaptureCalendar() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MONTHS.map((month) => (
          <div key={month.label} className="flex flex-col gap-2">
            <span className="text-muted-foreground font-mono text-mono uppercase">{month.label}</span>
            <div className="grid grid-cols-7 gap-1" aria-hidden="true">
              {monthCells(month.year, month.month).map((cell, index) =>
                cell ? (
                  <span
                    key={cell.key}
                    className={[
                      'flex size-6 items-center justify-center rounded-sm border text-[10px]',
                      cell.key >= LIVE_KEY && cell.key <= TODAY_KEY
                        ? 'border-primary/30 bg-primary/20 text-foreground'
                        : 'border-border text-muted-foreground',
                      cell.key === KUBERNETES_KEY || cell.key === APPROVED_KEY
                        ? 'ring-primary ring-2 ring-offset-1 ring-offset-background'
                        : '',
                    ].join(' ')}
                  >
                    {cell.date.getUTCDate()}
                  </span>
                ) : (
                  <span key={`blank-${index}`} />
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <span className="flex items-center gap-2">
          <span className="bg-primary/20 border-primary/30 inline-block size-3 rounded-sm border" />
          collector live
        </span>
        <span className="flex items-center gap-2">
          <span className="ring-primary inline-block size-3 rounded-sm ring-2 ring-offset-1 ring-offset-background" />
          8 September, on Kubernetes
        </span>
        <span className="flex items-center gap-2">
          <span className="ring-primary inline-block size-3 rounded-sm ring-2 ring-offset-1 ring-offset-background" />
          19 September, contract approved
        </span>
      </div>

      <p className="text-muted-foreground text-pretty text-xs">
        The collector has run since 26 August 2026. The ringed days are the move onto Kubernetes and
        the day the unified contract was approved; the latter is approved and not yet collecting.
      </p>
    </div>
  )
}

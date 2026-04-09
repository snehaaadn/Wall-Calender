import { holidaysInMonth } from '../utils/calendar'

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** @param {string} key YYYY-MM-DD */
function shortLabel(key) {
  const [, m, d] = key.split('-')
  const mi = Number(m) - 1
  return `${SHORT[mi] ?? m} ${Number(d)}`
}

/**
 * @param {{ year: number, monthIndex: number }} props
 */
export function HolidayStrip({ year, monthIndex }) {
  const list = holidaysInMonth(year, monthIndex)
  if (list.length === 0) return null

  return (
    <section
      aria-label="Observances this month"
      className="holiday-standout-strip rounded-2xl border-2 border-amber-400/35 bg-gradient-to-br from-amber-500/[0.12] via-amber-950/25 to-slate-950/40 px-4 py-4 shadow-[0_0_40px_-12px_rgba(251,191,36,0.35)] backdrop-blur-md md:px-5"
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-amber-200/90">Holiday</p>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list.map((h) => (
          <span
            key={h.key}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-300/40 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 shadow-[0_0_24px_-10px_rgba(251,191,36,0.55)]"
          >
            <span className="font-mono text-[11px] font-semibold text-amber-200">
              {shortLabel(h.key)}
            </span>
            <span className="max-w-[220px] truncate sm:max-w-none">{h.label}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

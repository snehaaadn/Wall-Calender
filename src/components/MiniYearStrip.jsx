import { useEffect, useRef } from 'react'
import {
  HOLIDAY_KEYS,
  buildMonthGrid,
  isInRange,
  toKey,
} from '../utils/calendar'

const SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * @param {{
 *   year: number,
 *   monthIndex: number,
 *   onSelectMonth: (monthIndex: number) => void,
 *   rangeStart: string | null,
 *   rangeEnd: string | null,
 *   todayKey: string,
 * }} props
 */
export function MiniYearStrip({
  year,
  monthIndex,
  onSelectMonth,
  rangeStart,
  rangeEnd,
  todayKey,
}) {
  const activeRef = useRef(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: 'smooth',
    })
  }, [monthIndex, year])

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl md:p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200/50">
          Year overview
        </p>
        <span className="font-mono text-xs tabular-nums text-slate-400">{year}</span>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1 pt-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [scrollbar-color:rgba(34,211,238,0.35)_transparent]"
        role="tablist"
        aria-label={`Months in ${year}`}
      >
        {SHORT.map((label, m) => {
          const cells = buildMonthGrid(year, m)
          const active = m === monthIndex

          return (
            <button
              key={label}
              ref={active ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`${label} ${year}`}
              onClick={() => onSelectMonth(m)}
              className={[
                'flex w-[4.25rem] shrink-0 snap-start flex-col gap-1 rounded-xl border p-1.5 text-left transition duration-200',
                active
                  ? 'border-cyan-400/45 bg-cyan-500/10 shadow-[0_0_24px_-8px_rgba(34,211,238,0.45)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-cyan-400/25 hover:bg-white/[0.06]',
              ].join(' ')}
            >
              <span
                className={[
                  'px-0.5 font-mono text-[9px] font-medium uppercase tracking-wide',
                  active ? 'text-cyan-100' : 'text-slate-500',
                ].join(' ')}
              >
                {label}
              </span>
              <div className="grid grid-cols-7 gap-px">
                {cells.map(({ date, inMonth }) => {
                  const key = toKey(date)
                  const inR = inMonth && isInRange(key, rangeStart, rangeEnd)
                  const isHoliday = inMonth && HOLIDAY_KEYS.has(key)
                  const isToday = inMonth && key === todayKey

                  let dot = 'bg-white/[0.12]'
                  if (!inMonth) dot = 'bg-transparent'
                  else if (inR) dot = 'bg-cyan-400/55'
                  else if (isHoliday) dot = 'bg-amber-400/45'
                  else dot = 'bg-white/[0.18]'

                  return (
                    <span
                      key={`${key}-${inMonth}`}
                      className={[
                        'aspect-square w-full min-w-0 rounded-[1px]',
                        dot,
                        isToday ? 'ring-[0.5px] ring-violet-400/80 ring-offset-0' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden
                    />
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

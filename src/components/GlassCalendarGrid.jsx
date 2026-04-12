import {
  HOLIDAY_KEYS,
  HOLIDAY_LABELS,
  buildMonthGrid,
  isInRange,
  rangeBounds,
  toKey,
} from '../utils/calendar'
import { HolidayStandoutMarker, holidayStandoutCellClasses } from '../holidayStandout'

const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * @param {{
 *   year: number,
 *   monthIndex: number,
 *   onPrevMonth: () => void,
 *   onNextMonth: () => void,
 *   onJumpToday: () => void,
 *   rangeStart: string | null,
 *   rangeEnd: string | null,
 *   onDayClick: (key: string) => void,
 *   todayKey: string,
 *   savedRanges?: { lo: string, hi: string }[],
 * }} props
 */
export function GlassCalendarGrid({
  year,
  monthIndex,
  onPrevMonth,
  onNextMonth,
  onJumpToday,
  rangeStart,
  rangeEnd,
  onDayClick,
  todayKey,
  savedRanges = [],
}) {
  const cells = buildMonthGrid(year, monthIndex)
  const title = `${MONTH_NAMES[monthIndex]} ${year}`
  const bounds = rangeBounds(rangeStart, rangeEnd)
  const [lo, hi] = bounds ?? [null, null]
  const sameDay = Boolean(lo && hi && lo === hi)

  const now = new Date()
  const viewingToday = year === now.getFullYear() && monthIndex === now.getMonth()

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-200/60">
            Months
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-white md:text-xl">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            className="flex h-10 min-w-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-200/90 transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onJumpToday}
            className={[
              'rounded-xl border px-3 py-2 text-xs font-medium transition',
              viewingToday
                ? 'border-white/10 bg-white/[0.03] text-slate-500'
                : 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300/50 hover:bg-cyan-500/20',
            ].join(' ')}
            aria-label="Jump to this month (today)"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex h-10 min-w-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-200/90 transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {WEEK.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 gap-1.5">
        {cells.map(({ date, inMonth }) => {
          const key = toKey(date)
          const inR = isInRange(key, rangeStart, rangeEnd)
          const isStart = lo && hi && key === lo
          const isEnd = lo && hi && key === hi
          const isHoliday = HOLIDAY_KEYS.has(key)
          const isToday = key === todayKey
          const inSavedRange =
            inMonth &&
            !inR &&
            savedRanges.some(({ lo: sLo, hi: sHi }) => isInRange(key, sLo, sHi))

          let cellBg = 'bg-transparent'
          if (inR && inMonth) {
            cellBg = 'bg-cyan-500/15'
            if (isStart || isEnd) cellBg = 'bg-cyan-500/30'
          } else if (inSavedRange) {
            cellBg = 'bg-cyan-300/[0.14]'
          }

          return (
            <button
              key={`${key}-${inMonth}`}
              type="button"
              disabled={!inMonth}
              title={
                isHoliday && inMonth
                  ? (HOLIDAY_LABELS.get(key) ?? 'Observance')
                  : inSavedRange
                    ? 'Saved range note'
                    : undefined
              }
              onClick={() => inMonth && onDayClick(key)}
              className={[
                'relative flex min-h-[44px] flex-col items-center justify-center rounded-xl border text-sm font-medium transition duration-150 will-change-transform',
                inMonth
                  ? 'cursor-pointer active:scale-[0.96] motion-reduce:active:scale-100'
                  : '',
                inMonth && !isHoliday
                  ? [
                      'border-white/5 text-slate-100 hover:border-cyan-400/30 hover:bg-white/5',
                      inSavedRange ? 'border-cyan-400/25' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  : '',
                inMonth && isHoliday
                  ? `text-slate-100 hover:bg-amber-500/15 ${holidayStandoutCellClasses(isHoliday, inMonth)}`
                  : '',
                !inMonth ? 'cursor-default border-transparent text-slate-600 opacity-40' : '',
                cellBg,
                isStart ? 'shadow-[0_0_20px_-4px_rgba(34,211,238,0.55)] ring-1 ring-cyan-300/70' : '',
                isEnd && !isStart
                  ? 'shadow-[0_0_20px_-4px_rgba(34,211,238,0.55)] ring-1 ring-cyan-300/70'
                  : '',
                isToday && inMonth ? 'ring-1 ring-violet-400/50' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className={[
                  'font-mono text-[13px] md:text-sm',
                  isHoliday && inMonth ? 'holiday-day-num font-semibold text-amber-50' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {date.getDate()}
              </span>
              {isHoliday && inMonth && (
                <HolidayStandoutMarker label={HOLIDAY_LABELS.get(key) ?? 'Observance'} />
              )}
              {isStart && inR && lo && hi && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-sm border border-cyan-300/60 bg-slate-950/90 font-mono text-[9px] text-cyan-200">
                  {sameDay ? '1' : 'S'}
                </span>
              )}
              {isEnd && inR && lo && hi && !sameDay && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-sm border border-cyan-300/60 bg-slate-950/90 font-mono text-[9px] text-cyan-200">
                  E
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
        Tap start → end; third tap resets. ← → or arrows change month; <span className="font-mono">T</span>{' '}
        today; <span className="font-mono">Esc</span> clears selection.
      </p>
    </div>
  )
}

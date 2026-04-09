import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { normalizeRangeKey, toKey } from '../utils/calendar'
import { MONTH_ORBIT_ACCENTS } from '../data/monthAccents'
import { GlassCalendarGrid } from './GlassCalendarGrid'
import { GlassHero } from './GlassHero'
import { GlassNotesDock } from './GlassNotesDock'
import { HolidayStrip } from '../holidayStandout'
import { MonthFlipPanel } from './MonthFlipPanel'

export default function GlassWallCalendar() {
  const today = useMemo(() => new Date(), [])
  const todayKey = toKey(today)

  const [view, setView] = useState(() => ({
    y: today.getFullYear(),
    m: today.getMonth(),
  }))

  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)

  const [monthNotes, setMonthNotes] = useLocalStorage('glass-cal-month-notes', {})
  const [dayNotes, setDayNotes] = useLocalStorage('glass-cal-day-notes', {})
  const [rangeNotes, setRangeNotes] = useLocalStorage('glass-cal-range-notes', {})

  const monthKey = `${view.y}-${String(view.m + 1).padStart(2, '0')}`
  const monthNote = monthNotes[monthKey] ?? ''
  const orbitAccent = MONTH_ORBIT_ACCENTS[view.m] ?? MONTH_ORBIT_ACCENTS[0]

  const rangeKey =
    rangeStart && rangeEnd ? normalizeRangeKey(rangeStart, rangeEnd) : null
  const rangeNote = rangeKey ? (rangeNotes[rangeKey] ?? '') : ''

  const singleDayNote =
    rangeStart && !rangeEnd ? (dayNotes[rangeStart] ?? '') : ''

  const setMonthNote = useCallback(
    (v) => {
      setMonthNotes((prev) => ({ ...prev, [monthKey]: v }))
    },
    [monthKey, setMonthNotes],
  )

  const onRangeNoteChange = useCallback(
    (v) => {
      if (!rangeKey) return
      setRangeNotes((prev) => ({ ...prev, [rangeKey]: v }))
    },
    [rangeKey, setRangeNotes],
  )

  const onSingleDayNoteChange = useCallback(
    (v) => {
      if (!rangeStart || rangeEnd) return
      setDayNotes((prev) => ({ ...prev, [rangeStart]: v }))
    },
    [rangeStart, rangeEnd, setDayNotes],
  )

  const onDayClick = useCallback(
    (key) => {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(key)
        setRangeEnd(null)
        return
      }
      if (key < rangeStart) {
        setRangeEnd(rangeStart)
        setRangeStart(key)
      } else {
        setRangeEnd(key)
      }
    },
    [rangeStart, rangeEnd],
  )

  const onPrevMonth = useCallback(() => {
    setView((v) => {
      if (v.m === 0) return { y: v.y - 1, m: 11 }
      return { y: v.y, m: v.m - 1 }
    })
  }, [])

  const onNextMonth = useCallback(() => {
    setView((v) => {
      if (v.m === 11) return { y: v.y + 1, m: 0 }
      return { y: v.y, m: v.m + 1 }
    })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onPrevMonth()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        onNextMonth()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPrevMonth, onNextMonth])

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.15),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `radial-gradient(ellipse 92% 62% at 50% -10%, rgba(${orbitAccent.r},${orbitAccent.g},${orbitAccent.b}, 0.2), transparent 56%)`,
        }}
      />

      <header className="relative z-10 mx-auto max-w-7xl px-4 pb-6 pt-10 md:px-8 md:pt-14">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white drop-shadow-[0_0_40px_rgba(34,211,238,0.15)] md:text-5xl">
          Orbital wall calendar
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 md:text-base">
          A wall calendar reimagined in glass and dusk—soft panes, a month that breathes beside its
          picture, and dates you can ring like quiet neon. Your margins stay yours; nothing leaves
          this browser unless you do.
        </p>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-8">
          <div className="order-1 lg:order-1 lg:col-span-4">
            <GlassHero year={view.y} monthIndex={view.m} />
          </div>
          <div className="order-2 flex flex-col gap-4 lg:order-2 lg:col-span-5">
            <MonthFlipPanel monthKey={monthKey}>
              <GlassCalendarGrid
                year={view.y}
                monthIndex={view.m}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onDayClick={onDayClick}
                todayKey={todayKey}
              />
            </MonthFlipPanel>
            <HolidayStrip year={view.y} monthIndex={view.m} />
          </div>
          <div className="order-3 lg:col-span-3">
            <GlassNotesDock
              monthKey={monthKey}
              monthNote={monthNote}
              onMonthNoteChange={setMonthNote}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              rangeNote={rangeNote}
              onRangeNoteChange={onRangeNoteChange}
              singleDayNote={singleDayNote}
              onSingleDayNoteChange={onSingleDayNoteChange}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

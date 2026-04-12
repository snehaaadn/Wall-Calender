import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  dayNoteEntriesForMonth,
  normalizeRangeKey,
  rangeNoteEntriesForMonth,
  toKey,
} from '../utils/calendar'
import { MONTH_ORBIT_ACCENTS } from '../data/monthAccents'
import { GlassCalendarGrid } from './GlassCalendarGrid'
import { GlassHero } from './GlassHero'
import { GlassNotesDock } from './GlassNotesDock'
import { HolidayStrip } from '../holidayStandout'
import { MonthFlipPanel } from './MonthFlipPanel'
import { MiniYearStrip } from './MiniYearStrip'
const OrbitCornerLottie = lazy(() =>
  import('./OrbitCornerLottie').then((mod) => ({ default: mod.OrbitCornerLottie })),
)

export default function GlassWallCalendar() {
  const today = useMemo(() => new Date(), [])
  const todayKey = toKey(today)
  const todayLabel = useMemo(() => {
    const d = today
    return {
      iso: toKey(d),
      weekday: d.toLocaleDateString(undefined, { weekday: 'long' }),
      month: d.toLocaleDateString(undefined, { month: 'long' }),
      day: d.getDate(),
      year: d.getFullYear(),
    }
  }, [today])

  const [view, setView] = useState(() => ({
    y: today.getFullYear(),
    m: today.getMonth(),
  }))

  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)

  const [dockRev, setDockRev] = useState(0)

  const [undoBanner, setUndoBanner] = useState(null)
  const restoreActionRef = useRef(null)
  const undoCountdownRef = useRef(0)

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

  const savedRangeRows = useMemo(
    () => rangeNoteEntriesForMonth(rangeNotes, view.y, view.m),
    [rangeNotes, view.y, view.m],
  )

  const savedDayRows = useMemo(
    () => dayNoteEntriesForMonth(dayNotes, view.y, view.m),
    [dayNotes, view.y, view.m],
  )

  const savedDayKeys = useMemo(
    () => savedDayRows.map((r) => r.dayKey),
    [savedDayRows],
  )

  const bumpDock = useCallback(() => {
    setDockRev((r) => r + 1)
  }, [])

  const dismissUndoBanner = useCallback(() => {
    window.clearInterval(undoCountdownRef.current)
    undoCountdownRef.current = 0
    restoreActionRef.current = null
    setUndoBanner(null)
  }, [])

  const runUndo = useCallback(() => {
    const fn = restoreActionRef.current
    dismissUndoBanner()
    fn?.()
    bumpDock()
  }, [dismissUndoBanner, bumpDock])

  const showUndoToast = useCallback(
    (label, restore) => {
      dismissUndoBanner()
      restoreActionRef.current = restore
      setUndoBanner({ key: Date.now(), label, secondsLeft: 5 })

      undoCountdownRef.current = window.setInterval(() => {
        setUndoBanner((prev) => {
          if (!prev) return null
          if (prev.secondsLeft <= 1) {
            window.clearInterval(undoCountdownRef.current)
            undoCountdownRef.current = 0
            restoreActionRef.current = null
            return null
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 }
        })
      }, 1000)
    },
    [dismissUndoBanner],
  )

  useEffect(() => {
    return () => window.clearInterval(undoCountdownRef.current)
  }, [])

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

  const deleteMonthNote = useCallback(() => {
    const snapshot = monthNotes[monthKey] ?? ''
    setMonthNotes((prev) => {
      const next = { ...prev }
      delete next[monthKey]
      return next
    })
    bumpDock()
    if (snapshot.trim()) {
      showUndoToast('Month memo removed', () => {
        setMonthNotes((p) => ({ ...p, [monthKey]: snapshot }))
      })
    }
  }, [monthKey, monthNotes, setMonthNotes, bumpDock, showUndoToast])

  const deleteRangeNoteByKey = useCallback(
    (storageKey) => {
      const snapshot = rangeNotes[storageKey] ?? ''
      setRangeNotes((prev) => {
        const next = { ...prev }
        delete next[storageKey]
        return next
      })
      bumpDock()
      if (snapshot.trim()) {
        showUndoToast('Range note removed', () => {
          setRangeNotes((p) => ({ ...p, [storageKey]: snapshot }))
        })
      }
    },
    [rangeNotes, setRangeNotes, bumpDock, showUndoToast],
  )

  const deleteDayNoteByKey = useCallback(
    (dayKey) => {
      const snapshot = dayNotes[dayKey] ?? ''
      setDayNotes((prev) => {
        const next = { ...prev }
        delete next[dayKey]
        return next
      })
      bumpDock()
      if (snapshot.trim()) {
        showUndoToast('Day note removed', () => {
          setDayNotes((p) => ({ ...p, [dayKey]: snapshot }))
        })
      }
    },
    [dayNotes, setDayNotes, bumpDock, showUndoToast],
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

  const jumpToToday = useCallback(() => {
    const d = new Date()
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }, [])

  const onSelectMonthFromStrip = useCallback((m) => {
    setView((v) => ({ ...v, m }))
  }, [])

  const clearSelection = useCallback(() => {
    setRangeStart(null)
    setRangeEnd(null)
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
      if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
      }
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        jumpToToday()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPrevMonth, onNextMonth, clearSelection, jumpToToday])

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

      <header className="relative z-10 mx-auto max-w-7xl px-4 pb-3 pt-10 md:px-8 md:pb-4 md:pt-14">
        <div className="grid grid-cols-1 items-start gap-y-4 sm:gap-y-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-x-10">
          <div className="order-1 flex min-w-0 max-w-2xl flex-col gap-1 lg:col-start-1 lg:self-start">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white drop-shadow-[0_0_40px_rgba(34,211,238,0.15)] md:text-5xl">
              Orbital wall calendar
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 md:text-base">
              A wall calendar reimagined in glass and dusk—soft panes, a month that breathes beside
              its picture, and dates you can ring like quiet neon. Your margins stay yours; nothing
              leaves this browser unless you do.
            </p>
          </div>
          <div className="order-2 flex w-full flex-row items-center justify-center gap-2 self-center md:gap-3 lg:col-start-2 lg:max-w-none lg:justify-self-end">
            <div className="flex shrink-0 justify-center">
              <Suspense
                fallback={
                  <div
                    className="h-[156px] w-[180px] shrink-0 rounded-3xl bg-transparent"
                    aria-hidden
                  />
                }
              >
                <OrbitCornerLottie />
              </Suspense>
            </div>
            <time
              dateTime={todayLabel.iso}
              className="flex min-w-0 flex-col items-center gap-0.5 text-center"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-violet-300/75">
                Today
              </span>
              <span className="font-mono text-xs font-medium text-slate-400 tabular-nums md:text-sm">
                {todayLabel.weekday}
              </span>
              <span className="mt-0.5 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0 leading-none">
                <span className="bg-gradient-to-br from-cyan-200 via-sky-100 to-violet-200 bg-clip-text text-2xl font-semibold tracking-tight text-transparent drop-shadow-[0_0_24px_rgba(34,211,238,0.2)] md:text-3xl">
                  {todayLabel.month}
                </span>
                <span className="font-mono text-3xl font-semibold tabular-nums text-white/95 md:text-4xl">
                  {todayLabel.day}
                </span>
              </span>
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                {todayLabel.year}
              </span>
            </time>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-1 md:px-8 md:pt-2">
        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch lg:gap-8">
          <div className="order-1 flex flex-col gap-6 md:gap-7 lg:order-1 lg:col-span-4">
            <GlassHero year={view.y} monthIndex={view.m} />
            <HolidayStrip year={view.y} monthIndex={view.m} />
          </div>
          <div className="order-2 flex flex-col gap-4 lg:order-2 lg:col-span-5">
            <MonthFlipPanel monthKey={monthKey}>
              <GlassCalendarGrid
                year={view.y}
                monthIndex={view.m}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
                onJumpToday={jumpToToday}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onDayClick={onDayClick}
                todayKey={todayKey}
                savedRanges={savedRangeRows}
                savedDayKeys={savedDayKeys}
              />
            </MonthFlipPanel>
            <MiniYearStrip
              year={view.y}
              monthIndex={view.m}
              onSelectMonth={onSelectMonthFromStrip}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              todayKey={todayKey}
            />
          </div>
          <div className="order-3 lg:col-span-3">
            <GlassNotesDock
              key={`${monthKey}|${rangeStart ?? ''}|${rangeEnd ?? ''}|${dockRev}`}
              monthKey={monthKey}
              monthNote={monthNote}
              onMonthNoteChange={setMonthNote}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              rangeNote={rangeNote}
              onRangeNoteChange={onRangeNoteChange}
              singleDayNote={singleDayNote}
              onSingleDayNoteChange={onSingleDayNoteChange}
              savedRangeRows={savedRangeRows}
              savedDayRows={savedDayRows}
              onDeleteMonthNote={deleteMonthNote}
              onDeleteRangeNote={deleteRangeNoteByKey}
              onDeleteDayNote={deleteDayNoteByKey}
            />
          </div>
        </div>
      </main>

      {undoBanner && (
        <div
          key={undoBanner.key}
          className="pointer-events-auto fixed bottom-6 left-1/2 z-[100] w-[min(92vw,22rem)] -translate-x-1/2 rounded-2xl border border-white/15 bg-slate-950/92 px-4 py-3 text-sm shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-slate-200">{undoBanner.label}</span>
            <span className="text-slate-600" aria-hidden>
              ·
            </span>
            <button
              type="button"
              onClick={runUndo}
              className="font-medium text-cyan-300 underline decoration-cyan-500/50 underline-offset-2 transition hover:text-cyan-200"
            >
              Undo
            </button>
            <span className="ml-auto font-mono text-xs tabular-nums text-slate-400">
              {undoBanner.secondsLeft}s
            </span>
          </div>
          <div
            className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-cyan-400/75 transition-[width] duration-1000 ease-linear"
              style={{ width: `${(undoBanner.secondsLeft / 5) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeRangeKey } from '../utils/calendar'

function clip(text, max) {
  const t = text.trim()
  if (!t) return ''
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

/**
 * @param {{
 *   monthKey: string,
 *   monthNote: string,
 *   onMonthNoteChange: (v: string) => void,
 *   rangeStart: string | null,
 *   rangeEnd: string | null,
 *   rangeNote: string,
 *   onRangeNoteChange: (v: string) => void,
 *   singleDayNote: string,
 *   onSingleDayNoteChange: (v: string) => void,
 *   savedRangeRows: { storageKey: string, lo: string, hi: string, text: string }[],
 *   savedDayRows: { dayKey: string, text: string }[],
 *   onDeleteMonthNote: () => void,
 *   onDeleteRangeNote: (storageKey: string) => void,
 *   onDeleteDayNote: (dayKey: string) => void,
 * }} props
 */
export function GlassNotesDock({
  monthKey,
  monthNote,
  onMonthNoteChange,
  rangeStart,
  rangeEnd,
  rangeNote,
  onRangeNoteChange,
  singleDayNote,
  onSingleDayNoteChange,
  savedRangeRows,
  savedDayRows,
  onDeleteMonthNote,
  onDeleteRangeNote,
  onDeleteDayNote,
}) {
  const hasRange = Boolean(rangeStart && rangeEnd)
  const hasSingle = Boolean(rangeStart && !rangeEnd)
  const rangeKey =
    rangeStart && rangeEnd ? normalizeRangeKey(rangeStart, rangeEnd) : null

  const [monthDraft, setMonthDraft] = useState(monthNote)
  const [rangeDraft, setRangeDraft] = useState(rangeNote)
  const [dayDraft, setDayDraft] = useState(singleDayNote)

  const [monthSavedAt, setMonthSavedAt] = useState(null)
  const [copyFlash, setCopyFlash] = useState(false)
  const copyTimer = useRef(0)

  const selectionLabel = hasRange
    ? `${rangeStart} → ${rangeEnd}`
    : hasSingle
      ? rangeStart
      : 'No span locked'

  const stamp = useCallback(() => {
    return new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }, [])

  const saveMonth = useCallback(() => {
    onMonthNoteChange(monthDraft)
    setMonthSavedAt(stamp())
  }, [monthDraft, onMonthNoteChange, stamp])

  const saveRange = useCallback(() => {
    if (!rangeKey) return
    onRangeNoteChange(rangeDraft)
  }, [rangeDraft, rangeKey, onRangeNoteChange])

  const saveDay = useCallback(() => {
    if (!rangeStart || rangeEnd) return
    onSingleDayNoteChange(dayDraft)
  }, [dayDraft, rangeStart, rangeEnd, onSingleDayNoteChange])

  useEffect(() => {
    return () => window.clearTimeout(copyTimer.current)
  }, [])

  const copySelection = useCallback(async () => {
    const line = hasRange
      ? `${rangeStart} → ${rangeEnd}`
      : hasSingle
        ? rangeStart
        : ''
    if (!line) return
    try {
      await navigator.clipboard.writeText(line)
    } catch {
      return
    }
    setCopyFlash(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopyFlash(false), 1600)
  }, [hasRange, hasSingle, rangeStart, rangeEnd])

  const showMonthCard = Boolean(monthSavedAt || monthNote.trim())
  const hasAnyStored =
    showMonthCard || savedRangeRows.length > 0 || savedDayRows.length > 0

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-3xl border border-violet-400/15 bg-gradient-to-b from-violet-950/30 to-slate-950/40 p-4 shadow-[0_0_50px_-20px_rgba(139,92,246,0.45)] backdrop-blur-2xl md:p-6">
      <div className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300/70">
          Signal log
        </p>
        <h3 className="text-lg font-semibold text-white">Notes</h3>
        <p className="mt-1 font-mono text-xs text-slate-400">
          Month: <span className="text-cyan-200/80">{monthKey}</span>
        </p>
      </div>

      <label className="block flex-1">
        <span className="mb-1.5 block text-xs font-medium text-slate-300">Month memo</span>
        <textarea
          value={monthDraft}
          onChange={(e) => setMonthDraft(e.target.value)}
          placeholder="Orbit-wide reminders…"
          rows={4}
          className="min-h-[96px] w-full resize-y rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={saveMonth}
            className="rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-4 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/25"
          >
            Save month
          </button>
        </div>
      </label>

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Selection</p>
            <p className="mt-1 font-mono text-xs text-cyan-100/90">{selectionLabel}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <button
              type="button"
              disabled={!hasRange && !hasSingle}
              onClick={copySelection}
              className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 transition enabled:hover:border-cyan-400/35 enabled:hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Copy dates
            </button>
            {copyFlash && (
              <span className="font-mono text-[10px] text-emerald-400/90">Copied</span>
            )}
          </div>
        </div>

        {hasRange && (
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-300">Range note</span>
            <textarea
              value={rangeDraft}
              onChange={(e) => setRangeDraft(e.target.value)}
              placeholder="Notes for this span…"
              rows={3}
              className="w-full resize-y rounded-xl border border-violet-500/20 bg-violet-950/20 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={saveRange}
                className="rounded-xl border border-violet-400/35 bg-violet-500/15 px-4 py-2 text-xs font-medium text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/25"
              >
                Save range
              </button>
            </div>
          </label>
        )}

        {hasSingle && (
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-300">Day note</span>
            <textarea
              value={dayDraft}
              onChange={(e) => setDayDraft(e.target.value)}
              placeholder="Notes for this day…"
              rows={3}
              className="w-full resize-y rounded-xl border border-cyan-500/20 bg-cyan-950/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={saveDay}
                className="rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-4 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/25"
              >
                Save day
              </button>
            </div>
          </label>
        )}

        {!hasRange && !hasSingle && (
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Select a day for a day note, or a second day to open range notes.
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">Stored</p>
        {!hasAnyStored && (
          <p className="mt-2 text-xs text-slate-500">Nothing saved for this month yet.</p>
        )}

        {showMonthCard && (
          <div className="mt-2 flex gap-2 rounded-lg border border-white/5 bg-black/20 px-2.5 py-2">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase text-slate-500">Month memo</p>
              <p className="mt-1 text-xs text-slate-200">{clip(monthNote, 120) || '—'}</p>
              {monthSavedAt && (
                <p className="mt-1 font-mono text-[10px] text-slate-500">Saved {monthSavedAt}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onDeleteMonthNote}
              className="h-fit shrink-0 rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-[11px] font-medium text-rose-200/90 hover:border-rose-400/50 hover:bg-rose-950/50"
            >
              Delete
            </button>
          </div>
        )}

        {savedRangeRows.length > 0 && (
          <div className="mt-3">
            <p className="font-mono text-[10px] uppercase text-slate-500">Range notes</p>
            <ul className="mt-1.5 space-y-2">
              {savedRangeRows.map((row) => (
                <li
                  key={row.storageKey}
                  className={`flex gap-2 rounded-lg border px-2.5 py-2 ${
                    hasRange && rangeKey === row.storageKey
                      ? 'border-cyan-400/30 bg-cyan-950/15'
                      : 'border-violet-500/15 bg-violet-950/10'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] text-violet-200/90">
                      {row.lo} → {row.hi}
                    </p>
                    <p className="mt-1 text-xs text-slate-200">{clip(row.text, 120) || '—'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteRangeNote(row.storageKey)}
                    className="h-fit shrink-0 rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-[11px] font-medium text-rose-200/90 hover:border-rose-400/50 hover:bg-rose-950/50"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {savedDayRows.length > 0 && (
          <div className="mt-3">
            <p className="font-mono text-[10px] uppercase text-slate-500">Day notes</p>
            <ul className="mt-1.5 space-y-2">
              {savedDayRows.map((row) => (
                <li
                  key={row.dayKey}
                  className={`flex gap-2 rounded-lg border px-2.5 py-2 ${
                    hasSingle && rangeStart === row.dayKey
                      ? 'border-cyan-400/30 bg-cyan-950/15'
                      : 'border-cyan-500/15 bg-cyan-950/10'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] text-cyan-200/90">{row.dayKey}</p>
                    <p className="mt-1 text-xs text-slate-200">{clip(row.text, 120) || '—'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteDayNote(row.dayKey)}
                    className="h-fit shrink-0 rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-[11px] font-medium text-rose-200/90 hover:border-rose-400/50 hover:bg-rose-950/50"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

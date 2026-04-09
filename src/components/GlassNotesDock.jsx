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
}) {
  const hasRange = Boolean(rangeStart && rangeEnd)
  const hasSingle = Boolean(rangeStart && !rangeEnd)

  const selectionLabel = hasRange
    ? `${rangeStart} → ${rangeEnd}`
    : hasSingle
      ? rangeStart
      : 'No span locked'

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
          value={monthNote}
          onChange={(e) => onMonthNoteChange(e.target.value)}
          placeholder="Orbit-wide reminders…"
          rows={4}
          className="min-h-[96px] w-full resize-y rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />
      </label>

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Selection</p>
        <p className="mt-1 font-mono text-xs text-cyan-100/90">{selectionLabel}</p>

        {hasRange && (
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-300">Range note</span>
            <textarea
              value={rangeNote}
              onChange={(e) => onRangeNoteChange(e.target.value)}
              placeholder="Notes for this span…"
              rows={3}
              className="w-full resize-y rounded-xl border border-violet-500/20 bg-violet-950/20 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </label>
        )}

        {hasSingle && (
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-300">Day note</span>
            <textarea
              value={singleDayNote}
              onChange={(e) => onSingleDayNoteChange(e.target.value)}
              placeholder="Notes for this day…"
              rows={3}
              className="w-full resize-y rounded-xl border border-cyan-500/20 bg-cyan-950/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>
        )}

        {!hasRange && !hasSingle && (
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Select a day on the grid to attach a day note, or pick a second day to unlock range
            notes.
          </p>
        )}
      </div>
    </div>
  )
}

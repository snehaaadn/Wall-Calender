/**
 * Extra classes for observance dates — only used by holiday stand-out.
 * @param {boolean} isHoliday
 * @param {boolean} inMonth
 */
export function holidayStandoutCellClasses(isHoliday, inMonth) {
  if (!isHoliday || !inMonth) return ''
  return 'holiday-glow-cell bg-gradient-to-b from-amber-500/[0.14] via-amber-950/25 to-slate-950/50'
}

/**
 * Extra classes for observance dates — only used by holiday stand-out.
 * @param {boolean} isHoliday
 * @param {boolean} inMonth
 */
export function holidayStandoutCellClasses(isHoliday, inMonth) {
  if (!isHoliday || !inMonth) return ''
  return 'border-2 border-amber-400/75 bg-amber-500/[0.1]'
}

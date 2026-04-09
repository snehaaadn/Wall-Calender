/** @param {Date} d */
export function toKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** @param {string} a @param {string} b */
export function normalizeRangeKey(a, b) {
  return a <= b ? `${a}_${b}` : `${b}_${a}`
}

/** @param {string} key @param {string | null} start @param {string | null} end */
export function rangeBounds(start, end) {
  if (!start || !end) return null
  return start <= end ? [start, end] : [end, start]
}

/** @param {string} key @param {string | null} start @param {string | null} end */
export function isInRange(key, start, end) {
  const b = rangeBounds(start, end)
  if (!b) return false
  const [lo, hi] = b
  return key >= lo && key <= hi
}

/**
 * @param {number} year
 * @param {number} month 0-11
 */
export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const pad = first.getDay()
  const cells = []
  const prevLast = new Date(year, month, 0).getDate()

  for (let i = pad - 1; i >= 0; i--) {
    const d = prevLast - i
    cells.push({ date: new Date(year, month - 1, d), inMonth: false })
  }
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true })
  }
  const trailing = (7 - (cells.length % 7)) % 7
  for (let d = 1; d <= trailing; d++) {
    cells.push({ date: new Date(year, month + 1, d), inMonth: false })
  }
  return cells
}

/** US federal + common cultural dates (static demo, 2026). */
export const HOLIDAYS = [
  { key: '2026-01-01', label: "New Year's Day" },
  { key: '2026-01-19', label: 'Martin Luther King Jr. Day' },
  { key: '2026-02-14', label: "Valentine's Day" },
  { key: '2026-02-16', label: "Presidents' Day" },
  { key: '2026-03-17', label: "St. Patrick's Day" },
  { key: '2026-04-01', label: 'April Fools’ Day' },
  { key: '2026-05-25', label: 'Memorial Day' },
  { key: '2026-06-19', label: 'Juneteenth' },
  { key: '2026-07-03', label: 'Independence Day (observed)' },
  { key: '2026-07-04', label: 'Independence Day' },
  { key: '2026-09-07', label: 'Labor Day' },
  { key: '2026-10-12', label: 'Columbus Day / Indigenous Peoples’ Day' },
  { key: '2026-10-31', label: 'Halloween' },
  { key: '2026-11-11', label: 'Veterans Day' },
  { key: '2026-11-26', label: 'Thanksgiving' },
  { key: '2026-12-25', label: 'Christmas Day' },
  { key: '2026-12-31', label: "New Year's Eve" },
]

export const HOLIDAY_KEYS = new Set(HOLIDAYS.map((h) => h.key))

/** @type {Map<string, string>} */
export const HOLIDAY_LABELS = new Map(HOLIDAYS.map((h) => [h.key, h.label]))

/**
 * @param {number} year
 * @param {number} monthIndex 0-11
 */
export function holidaysInMonth(year, monthIndex) {
  const mm = String(monthIndex + 1).padStart(2, '0')
  return HOLIDAYS.filter((h) => h.key.startsWith(`${year}-${mm}-`))
}

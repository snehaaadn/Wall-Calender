/**
 * Screen-reader label for observance days (no visible star — glow/ring only).
 * Part of removable holiday stand-out only.
 *
 * @param {{ label: string }} props
 */
export function HolidayStandoutMarker({ label }) {
  return <span className="sr-only">{label}</span>
}

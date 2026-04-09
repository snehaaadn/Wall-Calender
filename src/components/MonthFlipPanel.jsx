/**
 * Wall-calendar “page” snap-in when the visible month changes (3D tilt + blur settle).
 * Styles: `index.css` (`.calendar-flip-root`, `.calendar-flip-panel`, `@keyframes calendar-page-snap`).
 * Respects `prefers-reduced-motion` via CSS.
 *
 * @param {{ monthKey: string, children: import('react').ReactNode }} props
 */
export function MonthFlipPanel({ monthKey, children }) {
  return (
    <div className="calendar-flip-root">
      <div key={monthKey} className="calendar-flip-panel">
        {children}
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * One hero image per month (wall-calendar pairing with the grid).
 * URLs verified against Unsplash CDN — older photo IDs may 404 after catalog changes.
 */
const HERO_BY_MONTH = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=1600&q=80',
]

/** Month-specific line under the title — echoes wall-calendar + selection, changes with the page month. */
const HERO_TAGLINES = [
  'January settles like frost on glass—trace a cool arc between two anchors and let the month hold your first intentions.',
  'February’s hush is short and bright—clip a span across the pane and tuck whispers into the margin.',
  'March tilts toward light—your chosen ribbon of days glows forward, soft as torn paper on a kitchen wall.',
  'April rinses everything clean—mark the stretch you want to keep; rain-light catches on every selected cell.',
  'May unfurls in long strokes—string a luminous seam through the grid like ribbon on a printed calendar.',
  'June pours in at full height—burn a cyan corridor through high summer and anchor the weeks you’ll remember.',
  'July tastes of salt and heat—frame your holiday strip on glass; the sea-color range follows your touch.',
  'August lingers in gold—drag a slow glow across late summer; notes cling like pencil on a sun-faded page.',
  'September thins the air—clip autumn’s first corridor through the forest of dates; the grid keeps the crisp rhythm.',
  'October turns to ember—circle the weekends that matter; your span reads like ink bleeding through vellum light.',
  'November leans into dusk—cut a lantern path through shorter days; selection and notes share the same quiet flame.',
  'December folds the year shut—warm the pane with ranges that feel like ribbon, wax, and the last square glowing.',
]

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
 * @param {{ year: number, monthIndex: number }} props
 */
export function GlassHero({ year, monthIndex }) {
  const wrap = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [reduceMotion, setReduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const label = `${MONTH_NAMES[monthIndex]} ${year}`
  const heroSrc = HERO_BY_MONTH[monthIndex] ?? HERO_BY_MONTH[0]
  const tagline = HERO_TAGLINES[monthIndex] ?? HERO_TAGLINES[0]

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fn = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const onMove = useCallback(
    (e) => {
      if (reduceMotion) return
      const el = wrap.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      setTilt({ x: px * 8, y: py * -8 })
    },
    [reduceMotion],
  )

  const onLeave = useCallback(() => setTilt({ x: 0, y: 0 }), [])

  return (
    <div
      ref={wrap}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-950/80 to-slate-900/40 p-1 shadow-[0_0_60px_-10px_rgba(34,211,238,0.35)]"
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.35rem] md:aspect-[5/4]"
        style={
          reduceMotion
            ? undefined
            : {
                transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              }
        }
      >
        <img
          key={heroSrc}
          src={heroSrc}
          alt={`${MONTH_NAMES[monthIndex]} ${year} — calendar art`}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full scale-105 object-cover transition duration-700 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
          style={
            reduceMotion
              ? undefined
              : {
                  transform: `translate(${tilt.x * -0.4}px, ${tilt.y * 0.4}px) scale(1.05)`,
                }
          }
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_55%)]" />

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">
            Orbital month
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white drop-shadow-[0_0_24px_rgba(34,211,238,0.35)] md:text-4xl">
            {label}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-300/90">{tagline}</p>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl"
      />
    </div>
  )
}

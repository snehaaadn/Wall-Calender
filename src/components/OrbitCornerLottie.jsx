import * as LottieReact from 'lottie-react'
import planetOrbit from '../assets/planet-orbit-user.json'

/**
 * Source: user asset `Planet Orbit.json` (LottieFiles toolkit).
 * Fills remapped to glass-calendar cyan / violet / slate; shown at 180×180 CSS px.
 */
const lottieMod = LottieReact.default
const LottiePlayer =
  typeof lottieMod === 'function' ? lottieMod : lottieMod?.default

const PX = 180
/** Crop tall empty artboard (2050², planet centered) so the globe sits tight under the date. */
const VIEW_H = 156

export function OrbitCornerLottie({ className = '' }) {
  return (
    <div
      className={`pointer-events-none mx-auto flex shrink-0 select-none justify-center overflow-hidden rounded-3xl bg-transparent ${className}`}
      style={{ width: PX, height: VIEW_H }}
      aria-hidden
    >
      <div
        className="relative flex shrink-0 justify-center"
        style={{
          width: PX,
          height: PX,
          transform: 'translateY(-16%) scale(1.08)',
          transformOrigin: '50% 50%',
        }}
      >
        <LottiePlayer
          animationData={planetOrbit}
          loop
          className="relative z-[1]"
          style={{ width: PX, height: PX, display: 'block' }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid meet',
          }}
        />
      </div>
    </div>
  )
}

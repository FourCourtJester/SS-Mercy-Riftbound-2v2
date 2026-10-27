import { useVelcroValue } from '@single-studio/core'
import { Variable } from '@single-studio/core/source'

import { Logo } from '../components/Brand'
import { FitLines } from '../components/FitLines'
import { Stage } from '../components/Stage'

// Two 16:9 webcam frames, with a name plate under each.
// Add to OBS as a Browser source pointed at #/source/caster-webcams
//
// Transparent. Stack it in OBS as: the background source, then the cameras, then
// this on top, with each camera at the position listed here (OBS's Edit Transform
// takes these numbers directly) -- the frame sits over the camera's edges.
//
//   Caster 1   x 120   y 280   800 x 450
//   Caster 2   x 1000  y 280   800 x 450
const WINDOWS = [
  { x: 120, y: 280, width: 800, height: 450 },
  { x: 1000, y: 280, width: 800, height: 450 },
]

const RADIUS = 18

export default function CasterWebcams() {
  const message = useVelcroValue('variables.casters.message')

  return (
    <Stage>
      <Logo className="absolute top-[30px] left-1/2 w-[470px] -translate-x-1/2 drop-shadow-[0_6px_10px_rgba(4,10,40,0.5)]" />

      {WINDOWS.map((frame, index) => (
        <Window key={index} number={index + 1} {...frame} />
      ))}

      {/* Two lines at full size before anything shrinks, then smaller -- never a
          third line. Centred on y 966 by a band around it, so a second line grows the
          bar up and down evenly and stays clear of the name plates (which end at 890
          with a handle). */}
      <div
        className={`absolute top-[886px] left-1/2 flex h-[160px] w-[1300px] -translate-x-1/2 items-center transition-opacity duration-500 ${message ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="glass flex min-h-[96px] w-full items-center justify-center rounded-[48px] px-16 py-3 text-center type-display tracking-wide">
          <FitLines lines={2} max={44} min={28} strict className="w-full text-balance">
            <Variable name="casters.message" />
          </FitLines>
        </div>
      </div>
    </Stage>
  )
}

function Window({ number, x, y, width, height }) {
  const handle = useVelcroValue(`variables.casters.${number}.handle`)

  return (
    <>
      {/* The frame is drawn outside the hole, so the camera fills all of it. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: x,
          top: y,
          width,
          height,
          borderRadius: RADIUS,
          boxShadow: '0 0 0 6px var(--color-merc-cream), 0 0 0 12px var(--color-merc-blue), 0 0 46px 14px rgba(59, 123, 255, 0.45)',
        }}
      />

      <div className="absolute flex justify-center" style={{ left: x, top: y + height + 34, width }}>
        {/* Tilted in mirror image, each plate's inner end raised, so the pair
            frames the middle of the screen rather than leaning the same way. */}
        <div
          className={`flex min-w-[420px] max-w-[680px] ${number === 1 ? '-rotate-1' : 'rotate-1'} flex-col items-center rounded-[14px] border-[6px] border-merc-blue bg-merc-cream px-10 py-3 shadow-[0_10px_0_rgba(4,10,32,0.55)]`}
        >
          <div className="w-full text-center type-display text-[46px] text-merc-blue">
            <Variable name={`casters.${number}.name`} fallback={`Caster ${number}`} fit />
          </div>
          {handle ? (
            <div className="mt-1 w-full text-center text-[24px] font-bold tracking-wide text-merc-deep">
              <Variable name={`casters.${number}.handle`} fit />
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

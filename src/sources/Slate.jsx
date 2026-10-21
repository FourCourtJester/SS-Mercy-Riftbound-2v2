import { useTimer } from '@single-studio/core'
import { Timer, Variable } from '@single-studio/core/source'

import { Logo, Mercy } from '../components/Brand'
import { FitLines } from '../components/FitLines'
import { Stage } from '../components/Stage'

import '../css/slate.css'

// Full-screen holding slate: Mercy, the logo, a message and an optional countdown.
// Transparent -- stack it over the background source.
// Add to OBS as a Browser source pointed at #/source/slate
export default function Slate() {
  // The countdown's room is kept while it is off, so starting one on air fades it
  // in without moving the logo.
  const { active } = useTimer('timers.slate')

  return (
    <Stage>
      <div className="absolute top-[150px] left-[110px] h-[800px] w-[734px]">
        <Mercy className="mercy-float h-full w-full object-contain drop-shadow-[0_30px_60px_rgba(4,10,40,0.6)]" />
      </div>

      <div className="absolute top-0 right-[90px] flex h-full w-[1000px] flex-col items-center justify-center">
        <Logo className="w-[900px] drop-shadow-[0_18px_30px_rgba(4,10,40,0.55)]" />

        {/* Two lines at most where it can manage it: a long message steps down in
            size rather than wrapping onto a third. The room for two full-size lines
            is always kept, so a message changing on air does not move the logo, and
            one line sits in the middle of it. Balanced, so a wrap splits evenly
            instead of leaving one word alone on the second line. */}
        <div className="mt-12 flex min-h-[176px] w-full items-center justify-center px-6 text-center type-display tracking-wide text-merc-cream [text-shadow:0_6px_0_var(--color-merc-blue),0_14px_30px_rgba(4,10,40,0.7)]">
          <FitLines lines={2} max={76} min={52} className="w-full text-balance">
            <Variable name="slate.message" fallback="Starting Soon" />
          </FitLines>
        </div>

        <div
          className={`mt-10 h-[196px] transition-all duration-700 ease-out ${active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}
        >
          <div className="sticker -rotate-2 px-12 pt-5 pb-6">
            <Timer name="slate" fallback="" className="block type-display text-[120px] tracking-wider text-merc-cream" />
          </div>
        </div>
      </div>
    </Stage>
  )
}

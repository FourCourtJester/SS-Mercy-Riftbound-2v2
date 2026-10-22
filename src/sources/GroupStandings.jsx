import { useLayoutEffect, useRef } from 'react'
import { useVelcroCollection, useVelcroState, useVelcroValue } from '@single-studio/core'
import { Variable } from '@single-studio/core/source'

import { Logo } from '../components/Brand'
import { Fitted } from '../components/Fitted'
import { PairLogos, PairNames } from '../components/Pair'
import { Stage } from '../components/Stage'
import { standings } from '../components/tournament'

// Both round-robin pools side by side, best record at the top. The top two of each
// go through to the bracket, and are marked as such. Transparent -- stack it over
// the background source.
// Add to OBS as a Browser source pointed at #/source/group-standings
export default function GroupStandings() {
  const { value, loaded } = useVelcroCollection('variables.groups')
  const logos = useVelcroValue('variables.standings.logos') !== 'hidden'
  const note = useVelcroValue('variables.standings.note')
  const ranked = standings(value)

  return (
    <Stage>
      <header className="absolute top-[44px] right-[120px] left-[120px] flex items-center justify-between">
        <Logo className="w-[330px] drop-shadow-[0_12px_24px_rgba(4,10,40,0.55)]" />
        <div className="sticker rotate-[-1.5deg] px-10 pt-4 pb-5 type-display text-[64px] tracking-wide">
          <Variable name="standings.title" fallback="Group Stage" />
        </div>
      </header>

      {loaded ? (
        <div className="absolute top-[268px] left-[120px] flex gap-[80px]">
          <Group name="a" teams={ranked.a} logos={logos} />
          <Group name="b" teams={ranked.b} logos={logos} />
        </div>
      ) : null}

      {/* No footer at all when there is nothing to say. */}
      {note ? (
        <footer className="absolute bottom-[56px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[26px] font-extrabold tracking-[0.12em] text-merc-cream/85 uppercase [font-stretch:115%]">
          {note}
        </footer>
      ) : null}
    </Stage>
  )
}

const ROW = 124
const GAP = 16

/** The results columns, shared by the header labels and the rows so they line up. */
const W_WIDTH = 96
const L_WIDTH = 76

function Group({ name, teams, logos }) {
  // Read here rather than through <Variable> so Fitted can measure it; nothing
  // renders until it has loaded, the same as a Variable.
  const { value, loaded } = useVelcroState(`variables.standings.${name}`)

  return (
    <section className="w-[800px]">
      <div className="mb-5 flex items-end justify-between pr-[22px]">
        {/* Hugs a short name; a long one stops at what the W / L labels leave (800
            less their 192, the 22 of padding and a gap) and narrows to fit. */}
        {loaded ? (
          <div className="sticker max-w-[562px] min-w-0 -rotate-2 px-7 pt-3 pb-3.5 type-display text-[40px]">
            <Fitted text={value || `Group ${name.toUpperCase()}`} />
          </div>
        ) : (
          <span />
        )}
        <div className="flex gap-5 text-[22px] font-extrabold tracking-[0.14em] text-merc-cream/70 [font-stretch:115%]">
          <span className="text-center" style={{ width: W_WIDTH }}>
            W
          </span>
          <span className="text-center" style={{ width: L_WIDTH }}>
            L
          </span>
        </div>
      </div>

      <Ranked teams={teams} logos={logos} />
    </section>
  )
}

/**
 * The rows, absolutely placed by position, so a change in the standings slides each
 * team to its new place rather than cutting. Keyed by slot, which is the team.
 */
function Ranked({ teams, logos }) {
  return (
    <div className="relative" style={{ height: teams.length * ROW + (teams.length - 1) * GAP }}>
      {teams.map((team) => (
        <Row key={team.slot} team={team} logos={logos} />
      ))}
    </div>
  )
}

function Row({ team, logos }) {
  const { advancing } = team
  const top = (team.position - 1) * (ROW + GAP)
  const placed = useRef(false)

  // The first placement lands without moving; after that, moves glide.
  useLayoutEffect(() => {
    placed.current = true
  }, [])

  return (
    <div
      className={`absolute left-0 flex w-full items-center gap-5 overflow-hidden rounded-[18px] pr-[22px] pl-0 ${advancing ? 'glass' : 'border-2 border-merc-cream/10 bg-merc-night/55'}`}
      style={{ top, height: ROW, transition: placed.current ? 'top 900ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none' }}
    >
      <div
        className={`flex h-full w-[92px] shrink-0 items-center justify-center type-display text-[54px] ${advancing ? 'bg-merc-cream text-merc-blue' : 'bg-merc-cream/10 text-merc-cream/70'}`}
      >
        {team.rank}
      </div>

      {logos ? <PairLogos players={team.players} size={76} className="border-2 border-merc-cream/15 bg-merc-ink/70" /> : null}

      <PairNames players={team.players} size={36} />

      {/* Wins rank the table, so they take the emphasis points used to. */}
      <div
        className={`flex h-[80px] shrink-0 items-center justify-center rounded-[14px] type-display text-[48px] ${advancing ? 'bg-merc-blue text-merc-cream shadow-[0_0_24px_rgba(59,123,255,0.55)]' : 'bg-merc-cream/10 text-merc-cream'}`}
        style={{ width: W_WIDTH }}
      >
        {team.w}
      </div>
      <div className="shrink-0 text-center text-[40px] font-extrabold tabular-nums [font-stretch:110%]" style={{ width: L_WIDTH }}>
        {team.l}
      </div>
    </div>
  )
}

import { useLayoutEffect, useRef } from 'react'
import { useVelcroCollection, useVelcroState, useVelcroValue } from '@single-studio/core'
import { Image, Variable } from '@single-studio/core/source'

import { Logo, Twinkle } from '../components/Brand'
import { Fitted } from '../components/Fitted'
import { Stage } from '../components/Stage'
import { standings } from '../components/tournament'

// Both round-robin pools side by side, best record at the top. The top two of each
// go through to the bracket, and are marked as such. Transparent -- stack it over
// the background source.
// Add to OBS as a Browser source pointed at #/source/group-standings
export default function GroupStandings() {
  const { value, loaded } = useVelcroCollection('variables.groups')
  const logos = useVelcroValue('variables.standings.logos') !== 'hidden'
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

      <footer className="absolute bottom-[56px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[26px] font-extrabold tracking-[0.12em] text-merc-cream/85 uppercase [font-stretch:115%]">
        <Variable name="standings.note" fallback="Top 2 of each group advance to the playoffs" />
      </footer>
    </Stage>
  )
}

const ROW = 124
const GAP = 16

function Group({ name, teams, logos }) {
  // Read here rather than through <Variable> so Fitted can measure it; nothing
  // renders until it has loaded, the same as a Variable.
  const { value, loaded } = useVelcroState(`variables.standings.${name}`)

  return (
    <section className="w-[800px]">
      <div className="mb-5 flex items-end justify-between pr-[22px]">
        {/* Hugs a short name; a long one stops at what the W / L / PTS labels leave
            (800 less their 302, the 22 of padding and a gap) and narrows to fit. */}
        {loaded ? (
          <div className="sticker max-w-[452px] min-w-0 -rotate-2 px-7 pt-3 pb-3.5 type-display text-[40px]">
            <Fitted text={value || `Group ${name.toUpperCase()}`} />
          </div>
        ) : (
          <span />
        )}
        <div className="flex gap-5 text-[22px] font-extrabold tracking-[0.14em] text-merc-cream/70 [font-stretch:115%]">
          <span className="w-[76px] text-center">W</span>
          <span className="w-[76px] text-center">L</span>
          <span className="w-[110px] text-center">PTS</span>
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

      {logos ? (
        <div className="flex h-[92px] w-[92px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] border-2 border-merc-cream/15 bg-merc-ink/70 p-2">
          {team.logo ? <Image value={team.logo} className="flex h-full w-full items-center justify-center" /> : <Twinkle className="h-9 w-9 text-merc-cream/25" />}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className={`type-display text-[42px] leading-[1.05] ${team.name ? '' : 'text-merc-cream/40'}`}>
          <Fitted text={team.name || 'TBD'} />
        </div>
        {team.players ? (
          <div className="mt-1.5 truncate text-[24px] font-semibold tracking-wide text-merc-cream/70">{team.players}</div>
        ) : null}
      </div>

      <Stat value={team.w} />
      <Stat value={team.l} />
      <div
        className={`flex h-[80px] w-[110px] shrink-0 items-center justify-center rounded-[14px] type-display text-[48px] ${advancing ? 'bg-merc-blue text-merc-cream shadow-[0_0_24px_rgba(59,123,255,0.55)]' : 'bg-merc-cream/10 text-merc-cream'}`}
      >
        {team.pts}
      </div>
    </div>
  )
}

function Stat({ value }) {
  return <div className="w-[76px] shrink-0 text-center text-[40px] font-extrabold tabular-nums [font-stretch:110%]">{value}</div>
}

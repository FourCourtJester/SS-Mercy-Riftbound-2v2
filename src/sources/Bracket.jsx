import { useVelcroCollection, useVelcroValue } from '@single-studio/core'
import { Image, Variable } from '@single-studio/core/source'

import { Logo, Twinkle } from '../components/Brand'
import { Fitted } from '../components/Fitted'
import { Stage } from '../components/Stage'
import { teamIndex } from '../components/tournament'

// The four-team single-elimination playoff: two semi-finals into a final.
// Transparent -- stack it over the background source.
//
// A bracket slot names a team ('a1'); its name, players and logo are looked up in
// the groups on the way to air, so the two can never disagree.
// Add to OBS as a Browser source pointed at #/source/bracket

/** Where each match card sits, in broadcast pixels. */
const CARDS = {
  sf1: { x: 150, y: 316, label: 'Semifinal 1' },
  sf2: { x: 150, y: 686, label: 'Semifinal 2' },
  final: { x: 1110, y: 501, label: 'Final' },
}

const CARD_WIDTH = 680
const ROW = 104
const DIVIDER = 4
const CARD_HEIGHT = ROW * 2 + DIVIDER
const middle = (match) => CARDS[match].y + CARD_HEIGHT / 2

/** Who an empty slot is waiting for. */
const WAITING = { 'final.top': 'Winner Semifinal 1', 'final.bottom': 'Winner Semifinal 2' }

export default function Bracket() {
  const { value, loaded } = useVelcroCollection('variables.bracket')
  const groups = useVelcroCollection('variables.groups')
  const logos = useVelcroValue('variables.bracket.logos') !== 'hidden'
  const read = (key) => value[key]
  const teams = teamIndex(groups.value)
  // The team a slot points at, or nothing for an empty slot.
  const teamAt = (match, side) => teams[read(`${match}.${side}.team`)]

  const winner = read('final.winner')
  const champion = winner ? teamAt('final', winner)?.name : undefined

  return (
    <Stage>
      <header className="absolute top-[44px] right-[120px] left-[120px] flex items-center justify-between">
        <Logo className="w-[330px] drop-shadow-[0_12px_24px_rgba(4,10,40,0.55)]" />
        <div className="sticker rotate-[-1.5deg] px-10 pt-4 pb-5 type-display text-[64px] tracking-wide">
          <Variable name="bracket.title" fallback="Playoffs" />
        </div>
      </header>

      {loaded && groups.loaded ? (
        <>
          <Connectors sf1={Boolean(read('sf1.winner'))} sf2={Boolean(read('sf2.winner'))} />

          {Object.keys(CARDS).map((match) => (
            <Match key={match} match={match} read={read} teamAt={teamAt} logos={logos} />
          ))}

          <div
            className={`absolute flex justify-center transition-all duration-700 ease-out ${champion ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
            style={{ left: CARDS.final.x, top: CARDS.final.y + CARD_HEIGHT + 44, width: CARD_WIDTH }}
          >
            <div className="flex -rotate-2 items-center gap-5 rounded-[14px] border-[6px] border-merc-blue bg-merc-cream px-9 py-4 text-merc-blue shadow-[0_10px_0_rgba(4,10,32,0.55),0_0_60px_rgba(120,170,255,0.5)]">
              <Twinkle className="h-10 w-10 shrink-0" />
              <div className="flex min-w-0 flex-col items-center">
                <span className="text-[22px] font-black tracking-[0.3em] uppercase [font-stretch:115%]">Champions</span>
                <span className="max-w-[440px] type-display text-[46px]">
                  <Fitted text={champion ?? ''} />
                </span>
              </div>
              <Twinkle className="h-10 w-10 shrink-0" />
            </div>
          </div>
        </>
      ) : null}
    </Stage>
  )
}

/** The bracket lines. A semi's line lights up once it has a winner. */
function Connectors({ sf1, sf2 }) {
  const join = CARDS.sf1.x + CARD_WIDTH + 140
  const right = CARDS.sf1.x + CARD_WIDTH
  const line = (lit) => ({
    stroke: lit ? 'var(--color-merc-cream)' : 'rgba(244, 243, 239, 0.28)',
    filter: lit ? 'drop-shadow(0 0 8px rgba(140, 185, 255, 0.95))' : 'none',
    transition: 'stroke 600ms, filter 600ms',
  })

  return (
    <svg className="absolute inset-0" width="1920" height="1080" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${right} ${middle('sf1')}H${join}V${middle('final')}`} style={line(sf1)} />
      <path d={`M${right} ${middle('sf2')}H${join}V${middle('final')}`} style={line(sf2)} />
      <path d={`M${join} ${middle('final')}H${CARDS.final.x}`} style={line(sf1 && sf2)} />
    </svg>
  )
}

function Match({ match, read, teamAt, logos }) {
  const { x, y, label } = CARDS[match]
  const winner = read(`${match}.winner`)
  const final = match === 'final'

  return (
    <>
      <div
        className={`absolute text-[24px] font-black tracking-[0.22em] uppercase [font-stretch:115%] ${final ? 'text-merc-cream' : 'text-merc-cream/75'}`}
        style={{ left: x + 4, top: y - 42 }}
      >
        {label}
      </div>
      <div
        className={`absolute overflow-hidden rounded-[18px] ${final ? 'glass ring-4 ring-merc-blue' : 'glass'}`}
        style={{ left: x, top: y, width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <Team match={match} side="top" read={read} team={teamAt(match, 'top')} logos={logos} winner={winner} />
        <div style={{ height: DIVIDER }} className="bg-merc-cream/12" />
        <Team match={match} side="bottom" read={read} team={teamAt(match, 'bottom')} logos={logos} winner={winner} />
      </div>
    </>
  )
}

function Team({ match, side, read, team, logos, winner }) {
  const at = (field) => read(`${match}.${side}.${field}`)
  const seed = at('seed')
  const { name, logo, players } = team ?? {}
  const won = winner === side
  const lost = Boolean(winner) && !won

  return (
    <div
      className={`flex items-center gap-4 pr-4 transition-opacity duration-500 ${won ? 'bg-merc-blue/45' : ''} ${lost ? 'opacity-45' : ''}`}
      style={{ height: ROW }}
    >
      <div
        className={`flex h-full w-[78px] shrink-0 items-center justify-center type-display text-[28px] ${won ? 'bg-merc-cream text-merc-blue' : 'bg-merc-cream/10 text-merc-cream/75'}`}
      >
        {seed ?? ''}
      </div>

      {logos ? (
        <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border-2 border-merc-cream/15 bg-merc-ink/70 p-1.5">
          {logo ? <Image value={logo} className="flex h-full w-full items-center justify-center" /> : <Twinkle className="h-8 w-8 text-merc-cream/25" />}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className={`type-display ${name ? 'text-[38px]' : 'text-[28px] text-merc-cream/40'}`}>
          <Fitted text={name || WAITING[`${match}.${side}`] || 'TBD'} />
        </div>
        {name && players ? <div className="mt-1 truncate text-[21px] font-semibold tracking-wide text-merc-cream/70">{players}</div> : null}
      </div>

      <div
        className={`flex h-[78px] w-[92px] shrink-0 items-center justify-center rounded-[14px] type-display text-[46px] tabular-nums ${won ? 'bg-merc-cream text-merc-blue shadow-[0_0_26px_rgba(160,200,255,0.6)]' : 'bg-merc-ink/80 text-merc-cream'}`}
      >
        {name ? (at('score') ?? 0) : ''}
      </div>
    </div>
  )
}

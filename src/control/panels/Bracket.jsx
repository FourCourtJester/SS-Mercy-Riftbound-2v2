import { useVelcroCollection, useVelcroMutate, useVelcroValue } from '@single-studio/core'
import { Confirm, Field, Row, Select } from '@single-studio/core/control'

import { pairName, teamIndex } from '../../components/tournament'
import { FillStepper } from '../FillStepper'
import { HEADER_BUTTON, Panel } from '../Panel'

const MATCHES = [
  { match: 'sf1', title: 'Semifinal 1' },
  { match: 'sf2', title: 'Semifinal 2' },
  { match: 'final', title: 'Final' },
]

// The playoff bracket. "Fill from standings" fills the semis from the group
// graphic's order (A1 v B2, B1 v A2); "Won" marks a winner and carries them into
// the final.
//
// The fill is a guess at the format, so nothing it does is locked: every slot is a
// choice of any of the eight teams. What a slot stores is which team, never a copy
// of it -- players and logos always come from the groups.
export default function Bracket() {
  const mutate = useVelcroMutate()
  const { value } = useVelcroCollection('variables.groups')
  const teams = Object.entries(teamIndex(value)).map(([key, team]) => ({
    value: key,
    label: `${key.toUpperCase()} · ${pairName(team) || 'No players yet'}`,
  }))

  return (
    <>
      <Panel
        title="Bracket"
        actions={
          <>
            <Confirm
              label="Fill from standings"
              tone="primary"
              ask="Replace the bracket with A1 v B2, B1 v A2?"
              onConfirm={() => mutate('bracket:fill')}
              className={HEADER_BUTTON}
            />
            <Confirm label="Clear bracket" tone="danger" ask="Clear every team and result?" onConfirm={() => mutate('bracket:reset')} className={HEADER_BUTTON} />
          </>
        }
      >
        <Row>
          <Field name="bracket.title" label="Heading" placeholder="Playoffs" />
          <Select name="bracket.logos" label="Player logos" placeholder="Shown" options={[{ label: 'Hidden', value: 'hidden' }]} />
        </Row>
      </Panel>

      {/* The bracket as it reads on air, left to right, from lg. At md a third of
          the board is too narrow for a stepper and anything beside it, so the
          matches stack there and each team gets a line to itself. The gaps match
          the ones the board puts between panels. */}
      <div className="grid items-start gap-3 sm:gap-4 lg:grid-cols-3">
        {MATCHES.map(({ match, title }) => (
          <Panel key={match} title={title}>
            <Side match={match} side="top" teams={teams} />
            <Side match={match} side="bottom" teams={teams} />
          </Panel>
        ))}
      </div>
    </>
  )
}

/**
 * One team in a match, as one Row: a band of its own, a shade apart from the
 * other team's.
 *
 * md, where each match has the board's width: everything on one line, 6/4/2.
 * lg up, where each match is a third of it: the team on a line of its own, then
 * score and result, 8/4.
 */
function Side({ match, side, teams }) {
  const mutate = useVelcroMutate()
  const won = useVelcroValue(`variables.bracket.${match}.winner`) === side

  return (
    <Row className="rounded-md border border-slate-800 p-3 odd:bg-slate-950/60 even:bg-slate-800/60">
      <Select
        name={`bracket.${match}.${side}.team`}
        label={side === 'top' ? 'Top' : 'Bottom'}
        placeholder="— no team —"
        options={teams}
        className="md:col-span-6 lg:col-span-12"
      />
      <FillStepper name={`bracket.${match}.${side}.score`} label="Score" className="md:col-span-4 lg:col-span-8" />
      {/* Labelled like its neighbours, so it lines up with the stepper's input. */}
      <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-4">
        <span className="ss-label flex h-4 items-center text-xs font-medium tracking-wide text-slate-400 uppercase">Result</span>
        <button
          type="button"
          aria-pressed={won}
          onClick={() => mutate('bracket:winner', { match, side })}
          className={`min-h-[var(--ss-input-h,2.5rem)] rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${won ? 'bg-sky-600 text-white hover:bg-sky-500' : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}`}
        >
          {won ? 'Winner ✓' : 'Won'}
        </button>
      </div>
    </Row>
  )
}
